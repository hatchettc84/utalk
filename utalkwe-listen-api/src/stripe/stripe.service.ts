import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { CallersService } from '../callers/callers.service';
import type { SubscriptionTier } from '../callers/callers.types';
import { SmsService } from '../sms/sms.service';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import type { PriceToTierMap } from './stripe.types';

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly priceToTier: PriceToTierMap;

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly config: ConfigService,
    private readonly callersService: CallersService,
    private readonly smsService: SmsService,
  ) {
    this.stripe = new Stripe(config.getOrThrow<string>('STRIPE_SECRET_KEY'));
    this.webhookSecret = config.getOrThrow<string>('STRIPE_WEBHOOK_SECRET');
    this.priceToTier = {
      [config.get<string>('STRIPE_PRICE_BASIC') ?? '']: 'basic',
      [config.get<string>('STRIPE_PRICE_PREMIUM') ?? '']: 'premium',
      [config.get<string>('STRIPE_PRICE_VIP') ?? '']: 'vip',
    };
  }

  constructEvent(rawBody: Buffer, signature: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
  }

  async handleEvent(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.onSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.onSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.onPaymentFailed(event.data.object);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event: ${event.type}`);
    }
  }

  // ─── checkout.session.completed ─────────────────────────────────────────────

  private async onCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    if (session.mode === 'payment') {
      // One-time minute pack purchase
      await this.onPackPurchase(session);
      return;
    }

    // Subscription flow (existing behavior)
    const callerId = session.client_reference_id;
    const stripeCustomerId = this.resolveId(session.customer);
    const stripeSubscriptionId = this.resolveId(session.subscription);

    if (!callerId || !stripeCustomerId || !stripeSubscriptionId) {
      this.logger.warn('checkout.session.completed missing required fields', {
        callerId,
        stripeCustomerId,
        stripeSubscriptionId,
      });
      return;
    }

    const subscription = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
    const tier = this.tierFromSubscription(subscription);

    const { error: callerErr } = await this.supabase
      .from('callers')
      .update({ subscription_tier: tier, stripe_customer_id: stripeCustomerId })
      .eq('id', callerId);
    if (callerErr) this.logger.error('Failed to update caller tier', callerErr);

    const { error: subErr } = await this.supabase.from('subscriptions').upsert(
      {
        caller_id: callerId,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_customer_id: stripeCustomerId,
        tier,
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      },
      { onConflict: 'stripe_subscription_id' },
    );
    if (subErr) this.logger.error('Failed to upsert subscription record', subErr);

    this.logger.log(`Checkout complete: caller ${callerId} → tier ${tier}`);
  }

  // ─── One-time pack purchase ─────────────────────────────────────────────────

  /**
   * Handles `mode: 'payment'` checkout sessions for minute packs.
   * The Payment Link metadata must include `pack_minutes` (e.g. "25").
   * The buyer's phone number comes from the session's customer details.
   * Idempotent via UNIQUE constraint on stripe_checkout_session_id.
   */
  private async onPackPurchase(session: Stripe.Checkout.Session): Promise<void> {
    const sessionId = session.id;
    const paymentIntentId = this.resolveId(session.payment_intent);
    const amountCents = session.amount_total ?? 0;

    // Pull pack_minutes from session metadata (Payment Link metadata flows through)
    const metadata = session.metadata ?? {};
    const packMinutesStr = metadata['pack_minutes'];
    const packName = metadata['pack_name'] ?? `Pack ${packMinutesStr ?? '?'}`;
    const minutes = packMinutesStr ? Number.parseInt(packMinutesStr, 10) : NaN;

    if (!Number.isFinite(minutes) || minutes <= 0) {
      this.logger.error(
        `Pack purchase missing/invalid pack_minutes metadata: session=${sessionId} metadata=${JSON.stringify(metadata)}`,
      );
      return;
    }

    // Find caller by phone — buyer enters it during Stripe Checkout
    const phone = session.customer_details?.phone ?? '';
    if (!phone) {
      this.logger.error(`Pack purchase has no phone — cannot link to caller. session=${sessionId}`);
      return;
    }

    const normalized = this.callersService.normalizePhone(phone);
    const caller = await this.callersService.findByPhone(normalized);
    if (!caller) {
      this.logger.error(
        `Pack purchase: no caller found for phone ${this.callersService.maskPhone(normalized)}. session=${sessionId}`,
      );
      return;
    }

    // Idempotency check — skip if we've already processed this session
    const { data: existing } = await this.supabase
      .from('minute_purchases')
      .select('id')
      .eq('stripe_checkout_session_id', sessionId)
      .maybeSingle();
    if (existing) {
      this.logger.log(`Pack purchase already processed: session=${sessionId}`);
      return;
    }

    // 1) Insert purchase record
    const { error: insertErr } = await this.supabase.from('minute_purchases').insert({
      caller_id: caller.id,
      stripe_payment_intent_id: paymentIntentId,
      stripe_checkout_session_id: sessionId,
      pack_name: packName,
      minutes,
      amount_cents: amountCents,
      status: 'completed',
    });
    if (insertErr) {
      this.logger.error('Failed to insert minute_purchases row', insertErr);
      return;
    }

    // 2) Add minutes to balance
    const newBalance = await this.callersService.addMinutes(caller.id, minutes);

    // 3) Send confirmation SMS (service communication — no TCPA gate needed)
    try {
      await this.smsService.sendPackPurchaseConfirmation(
        caller.id,
        normalized,
        caller.name,
        minutes,
        newBalance,
      );
    } catch (err) {
      this.logger.error('Pack purchase confirmation SMS failed', err);
    }

    this.logger.log(
      `Pack purchase processed: caller=${caller.id} pack=${packName} minutes=${minutes} newBalance=${newBalance}`,
    );
  }

  // ─── customer.subscription.updated ──────────────────────────────────────────

  private async onSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const stripeCustomerId = this.resolveId(subscription.customer);
    const tier = this.tierFromSubscription(subscription);
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    const { error: subErr } = await this.supabase
      .from('subscriptions')
      .update({ status: subscription.status, tier, current_period_end: currentPeriodEnd })
      .eq('stripe_subscription_id', subscription.id);
    if (subErr) this.logger.error('Failed to update subscription record', subErr);

    if (stripeCustomerId) {
      const { error: callerErr } = await this.supabase
        .from('callers')
        .update({ subscription_tier: tier })
        .eq('stripe_customer_id', stripeCustomerId);
      if (callerErr) this.logger.error('Failed to update caller tier on subscription update', callerErr);
    }

    this.logger.log(`Subscription updated: ${subscription.id} → ${tier} (${subscription.status})`);
  }

  // ─── customer.subscription.deleted ──────────────────────────────────────────

  private async onSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const stripeCustomerId = this.resolveId(subscription.customer);

    const { error: subErr } = await this.supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', subscription.id);
    if (subErr) this.logger.error('Failed to cancel subscription record', subErr);

    if (stripeCustomerId) {
      const { error: callerErr } = await this.supabase
        .from('callers')
        .update({ subscription_tier: 'free' })
        .eq('stripe_customer_id', stripeCustomerId);
      if (callerErr) this.logger.error('Failed to revert caller to free', callerErr);
    }

    this.logger.log(`Subscription canceled: ${subscription.id} — caller reverted to free`);
  }

  // ─── invoice.payment_failed ──────────────────────────────────────────────────

  private async onPaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    // FR54: past_due does NOT immediately revoke access — tier stays the same
    const stripeSubscriptionId = this.resolveId(invoice.subscription);
    if (!stripeSubscriptionId) return;

    const { error } = await this.supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', stripeSubscriptionId);
    if (error) this.logger.error('Failed to mark subscription past_due', error);

    this.logger.warn(`Payment failed — subscription ${stripeSubscriptionId} marked past_due`);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private tierFromSubscription(subscription: Stripe.Subscription): SubscriptionTier {
    const priceId = subscription.items.data[0]?.price.id;
    if (priceId) {
      const tier = this.priceToTier[priceId];
      if (tier) return tier;
    }
    return 'basic';
  }

  private resolveId(obj: string | { id: string } | null | undefined): string | null {
    if (!obj) return null;
    return typeof obj === 'string' ? obj : obj.id;
  }
}

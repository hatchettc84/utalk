import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
import Twilio from 'twilio';
import { SUPABASE_CLIENT } from '../supabase/supabase.module';
import type { SmsMessageType } from './sms.types';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client: ReturnType<typeof Twilio>;
  private readonly fromNumber: string;
  private readonly linkBasic: string;
  private readonly linkPremium: string;
  private readonly linkVip: string;

  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
    private readonly config: ConfigService,
  ) {
    this.client = Twilio(
      config.getOrThrow<string>('TWILIO_ACCOUNT_SID'),
      config.getOrThrow<string>('TWILIO_AUTH_TOKEN'),
    );
    this.fromNumber = config.getOrThrow<string>('TWILIO_PHONE_NUMBER');
    this.linkBasic = config.get<string>('STRIPE_PAYMENT_LINK_BASIC') ?? '';
    this.linkPremium = config.get<string>('STRIPE_PAYMENT_LINK_PREMIUM') ?? '';
    this.linkVip = config.get<string>('STRIPE_PAYMENT_LINK_VIP') ?? '';
  }

  // ─── TCPA-gated send ─────────────────────────────────────────────────────────

  /**
   * Send an SMS to a caller.
   * By default, requires consent signal (request_coaching_plan called in a session).
   * Pass bypassConsent=true for crisis SMS and service communications.
   */
  async send(
    callerId: string,
    phone: string,
    body: string,
    messageType: SmsMessageType,
    bypassConsent = false,
  ): Promise<void> {
    if (!bypassConsent) {
      const hasConsent = await this.hasConsentSignal(callerId);
      if (!hasConsent) {
        this.logger.warn(
          `SMS blocked — no consent signal for caller ${callerId} (TCPA gate)`,
        );
        return;
      }
    }

    await this.sendWithLogging(callerId, phone, body, messageType);
  }

  // ─── Upgrade prompt (service communication — bypasses TCPA) ─────────────────

  async sendUpgradePrompt(
    callerId: string,
    phone: string,
    callerName: string | null,
  ): Promise<void> {
    const name = callerName ?? 'there';
    const lines = [
      `Hey ${name} — this is Haven.`,
      "You've used your free calls for this month.",
      '',
      'To keep talking, choose a plan:',
    ];
    if (this.linkBasic) lines.push(`• Basic (unlimited calls): ${this.linkBasic}`);
    if (this.linkPremium) lines.push(`• Premium: ${this.linkPremium}`);
    if (this.linkVip) lines.push(`• VIP: ${this.linkVip}`);
    lines.push('', "You're not alone — I'll be here when you're ready.");

    await this.sendWithLogging(callerId, phone, lines.join('\n'), 'subscription');
  }

  // ─── Internals ───────────────────────────────────────────────────────────────

  private async hasConsentSignal(callerId: string): Promise<boolean> {
    // Consent = request_coaching_plan was called in any session (sets issue_category)
    const { count, error } = await this.supabase
      .from('call_sessions')
      .select('id', { count: 'exact', head: true })
      .eq('caller_id', callerId)
      .not('issue_category', 'is', null);

    if (error) {
      this.logger.error('Consent check failed — blocking SMS as safe default', error);
      return false;
    }
    return (count ?? 0) > 0;
  }

  private async sendWithLogging(
    callerId: string,
    phone: string,
    body: string,
    messageType: SmsMessageType,
  ): Promise<void> {
    let twilioSid: string | null = null;

    try {
      const msg = await this.client.messages.create({ body, from: this.fromNumber, to: phone });
      twilioSid = msg.sid;
      this.logger.log(`SMS sent to ${this.maskPhone(phone)} [${messageType}] sid=${msg.sid}`);
    } catch (err) {
      this.logger.error(`Twilio send failed to ${this.maskPhone(phone)}`, err);
    }

    const status: 'sent' | 'failed' = twilioSid === null ? 'failed' : 'sent';

    // Log to sms_log regardless of Twilio result
    const { error: logErr } = await this.supabase.from('sms_log').insert({
      caller_id: callerId,
      phone,
      message_type: messageType,
      body,
      twilio_sid: twilioSid,
      status,
    });
    if (logErr) this.logger.error('Failed to write sms_log entry', logErr);
  }

  // ─── General follow-up (service communication — bypasses TCPA) ──────────────

  async sendCallFollowUp(
    callerId: string,
    phone: string,
    callerName: string | null,
    issueSummary: string | null,
  ): Promise<void> {
    const name = callerName ?? 'Friend';
    const lines = [
      `Hey ${name}, this is Haven from UtalkWe Listen.`,
      '',
      'Thank you for calling today. It takes courage to reach out, and I want you to know that what you shared matters.',
    ];

    if (issueSummary) {
      lines.push('', "I'm holding space for what you're going through. You don't have to carry it alone.");
    }

    lines.push(
      '',
      "If you ever need to talk again, I'm here — anytime.",
      '',
      'Take care of yourself today.',
      '— Haven',
    );

    await this.sendWithLogging(callerId, phone, lines.join('\n'), 'follow_up');
  }

  private maskPhone(phone: string): string {
    if (phone.length < 7) return '***';
    return `${phone.slice(0, 3)}***${phone.slice(-4)}`;
  }
}

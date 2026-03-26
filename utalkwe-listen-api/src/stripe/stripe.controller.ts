import { Controller, Headers, HttpCode, Logger, Post, RawBody } from '@nestjs/common';
import type Stripe from 'stripe';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(private readonly stripeService: StripeService) {}

  @Post('webhook')
  @HttpCode(200)
  handleWebhook(
    @RawBody() rawBody: Buffer,
    @Headers('stripe-signature') signature: string,
  ): { received: boolean } | { error: string } {
    if (!signature) {
      this.logger.warn('Stripe webhook received with no signature');
      return { error: 'Missing signature' };
    }

    let event: Stripe.Event;
    try {
      event = this.stripeService.constructEvent(rawBody, signature);
    } catch (err) {
      this.logger.warn(`Stripe signature verification failed: ${String(err)}`);
      return { error: 'Invalid signature' };
    }

    // Process asynchronously — HTTP 200 is returned immediately
    setImmediate(() =>
      this.stripeService.handleEvent(event).catch(e =>
        this.logger.error(`Stripe event processing failed [${event.type}]`, e),
      ),
    );

    return { received: true };
  }
}

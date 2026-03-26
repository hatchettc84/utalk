import { Body, Controller, HttpCode, Logger, Post, UseGuards } from '@nestjs/common';
import { VapiWebhookGuard } from '../common/guards/vapi-webhook.guard';
import { VapiService } from './vapi.service';
import type { VapiWebhookPayload } from './vapi.types';

@Controller('vapi')
export class VapiController {
  private readonly logger = new Logger(VapiController.name);

  constructor(private readonly vapiService: VapiService) {}

  @Post('webhook')
  @UseGuards(VapiWebhookGuard)
  @HttpCode(200)
  async handleWebhook(@Body() payload: VapiWebhookPayload): Promise<unknown> {
    const message = payload?.message;
    const type = message?.type;
    const phone = message?.call?.customer?.number ?? '';
    const vapiCallId = message?.call?.id ?? '';

    try {
      switch (type) {
        case 'assistant-request':
          return await this.vapiService.buildDynamicAssistant(phone, vapiCallId);

        case 'call-start':
          await this.vapiService.onCallStart(phone, vapiCallId);
          return { received: true };

        case 'end-of-call-report':
          await this.vapiService.onCallEnd(message);
          return { received: true };

        case 'function-call':
          return await this.vapiService.handleFunctionCall(message);

        default:
          return { received: true };
      }
    } catch (err) {
      // HTTP 200 always — errors are logged, never surfaced as non-200 responses
      this.logger.error(`Webhook error [type=${type ?? 'unknown'}]`, err);
      return { received: true };
    }
  }
}

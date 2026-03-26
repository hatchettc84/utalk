import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VapiWebhookGuard implements CanActivate {
  private readonly logger = new Logger(VapiWebhookGuard.name);

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    const incoming = request.headers['x-vapi-secret'];
    const expected = this.config.get<string>('VAPI_WEBHOOK_SECRET');

    if (!incoming || !expected || incoming !== expected) {
      this.logger.warn(`Webhook secret mismatch — incoming: "${incoming ?? '(none)'}", expected: "${expected ?? '(not set)'}"`);
      throw new UnauthorizedException('Invalid webhook secret');
    }
    return true;
  }
}

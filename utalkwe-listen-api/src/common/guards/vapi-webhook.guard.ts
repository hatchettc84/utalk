import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VapiWebhookGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    const incoming = request.headers['x-vapi-secret'];
    const expected = this.config.get<string>('VAPI_WEBHOOK_SECRET');

    if (!incoming || !expected || incoming !== expected) {
      throw new UnauthorizedException('Invalid webhook secret');
    }
    return true;
  }
}

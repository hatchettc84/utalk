import { CanActivate, ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminGuard implements CanActivate {
  private readonly logger = new Logger(AdminGuard.name);

  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('ADMIN_SECRET');
    if (!expected) {
      this.logger.warn('ADMIN_SECRET not set — admin endpoints disabled');
      throw new UnauthorizedException('Admin endpoints disabled');
    }

    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    const incoming = request.headers['x-admin-secret'];

    if (!incoming || incoming !== expected) {
      this.logger.warn('Admin request rejected — invalid or missing x-admin-secret header');
      throw new UnauthorizedException('Invalid admin secret');
    }
    return true;
  }
}

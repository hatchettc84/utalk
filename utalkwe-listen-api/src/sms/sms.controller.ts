import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../common/guards/admin.guard';
import { SmsService } from './sms.service';

@Controller('admin/sms')
@UseGuards(AdminGuard)
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  /**
   * Send a test SMS to any number, bypassing consent gating and sms_log writes.
   * Returns the Twilio result (sid or error code/message) directly so you can
   * verify Twilio credentials, from-number, and recipient format in isolation.
   *
   * Auth: header `x-admin-secret: $ADMIN_SECRET`
   * Body: { to: "+1XXXXXXXXXX", message: "..." }
   */
  @Post('test')
  async test(
    @Body() body: { to?: string; message?: string },
  ): Promise<{ ok: boolean; sid: string | null; errorCode: string | null; errorMessage: string | null }> {
    const to = body.to ?? '';
    const message = body.message ?? 'UtalkWe Listen test SMS.';
    const result = await this.smsService.sendRaw(to, message);
    return { ok: result.sid !== null, ...result };
  }
}

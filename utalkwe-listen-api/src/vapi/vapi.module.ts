import { Module } from '@nestjs/common';
import { CallersModule } from '../callers/callers.module';
import { CoachingModule } from '../coaching/coaching.module';
import { VapiWebhookGuard } from '../common/guards/vapi-webhook.guard';
import { SmsModule } from '../sms/sms.module';
import { VapiController } from './vapi.controller';
import { VapiService } from './vapi.service';

@Module({
  imports: [CallersModule, CoachingModule, SmsModule],
  controllers: [VapiController],
  providers: [VapiService, VapiWebhookGuard],
  exports: [VapiService],
})
export class VapiModule {}

import { Module } from '@nestjs/common';
import { CallersModule } from '../callers/callers.module';
import { AdminGuard } from '../common/guards/admin.guard';
import { DailyAffirmationCron } from './daily-affirmation.cron';
import { SmsController } from './sms.controller';
import { SmsService } from './sms.service';

@Module({
  imports: [CallersModule],
  controllers: [SmsController],
  providers: [SmsService, DailyAffirmationCron, AdminGuard],
  exports: [SmsService],
})
export class SmsModule {}

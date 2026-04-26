import { Module } from '@nestjs/common';
import { CallersModule } from '../callers/callers.module';
import { SmsModule } from '../sms/sms.module';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [CallersModule, SmsModule],
  controllers: [StripeController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}

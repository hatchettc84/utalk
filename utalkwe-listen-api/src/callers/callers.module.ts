import { Module } from '@nestjs/common';
import { CallersService } from './callers.service';

@Module({
  providers: [CallersService],
  exports: [CallersService],
})
export class CallersModule {}

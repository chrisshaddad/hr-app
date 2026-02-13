import { Module } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { HolidaysController } from './holidays.controller';

@Module({
  controllers: [HolidaysController],
  providers: [HolidaysService],
})
export class HolidaysModule {}

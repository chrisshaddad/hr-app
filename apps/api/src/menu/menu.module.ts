import { Module } from '@nestjs/common';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule], // ✅ ADD THIS
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule { }

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators';
import { MenuGroupDto } from './menu.dto';
import type { User } from '@repo/db';
import { ConditionalModule } from '@nestjs/config';

@ApiTags('menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) { }

  @UseGuards(AuthGuard, RolesGuard)
  @Get()
  @ApiResponse({ status: 200, description: 'Returns the menu items.', type: [MenuGroupDto] })
  async getMenu(@CurrentUser() user: User) {
    console.log('Fetching menu for user:', user.id);
    return this.menuService.getMenu(user);
  }
}

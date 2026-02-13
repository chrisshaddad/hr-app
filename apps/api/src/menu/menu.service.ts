import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { MenuSchema, MenuResponse } from './menu.schema';
import { menuItems } from './menu.data';
import { prisma, User } from '@repo/db';

@Injectable()
export class MenuService {
  constructor() { }

  async getMenu(user: User): Promise<MenuResponse> {
    console.log('MenuService.getMenu called for user:', user.id);
    const result = MenuSchema.safeParse(menuItems);

    if (!result.success) {
      throw new InternalServerErrorException('Menu data validation failed');
    }

    if (!user.organizationId) {
      throw new InternalServerErrorException(
        'User does not belong to an organization',
      );
    }

    /* await prisma.activityLog.create({
       data: {
         organizationId: user.organizationId,
         actorUserId: user.id,
         entityType: 'MENU',
         entityId: 'menu-fetch',
         action: 'FETCH',
         data: { menu: result.data },
       },
     });*/

    return result.data;
  }
}

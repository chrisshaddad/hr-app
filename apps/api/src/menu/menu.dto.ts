import { ApiProperty } from '@nestjs/swagger';

export class MenuLinkDto {
  @ApiProperty() id!: string;
  @ApiProperty() label!: string;
  @ApiProperty({ enum: ['LINK'] }) type!: 'LINK';
  @ApiProperty() route!: string;
}

export class MenuGroupDto {
  @ApiProperty() id!: string;
  @ApiProperty() label!: string;
  @ApiProperty({ enum: ['GROUP'] }) type!: 'GROUP';
  @ApiProperty({ required: false }) icon?: string;
  @ApiProperty({ type: () => [MenuLinkDto] }) children!: (MenuLinkDto | MenuGroupDto)[];
}

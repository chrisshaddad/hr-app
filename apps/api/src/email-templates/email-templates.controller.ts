import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '@repo/db';
import { EmailTemplateTypesService } from './email-template-types.service';
import { EmailTemplateSettingsService } from './email-template-settings.service';
import { ZodValidationPipe } from '../common/pipes';
import { emailTemplateSchema, type EmailTemplateSchema } from '@repo/contracts';

@ApiTags('email-templates')
@Controller('email-templates')
export class EmailTemplatesController {
  constructor(
    private readonly templateTypesService: EmailTemplateTypesService,
    private readonly templateSettingsService: EmailTemplateSettingsService,
  ) {}

  @Get('types')
  @ApiOperation({ summary: 'List all available email template types' })
  @ApiOkResponse({ description: 'Template types retrieved successfully' })
  async listTypes() {
    return this.templateTypesService.findAll();
  }

  @Get('types/:typeId')
  @ApiOperation({ summary: 'Get a specific email template type' })
  @ApiOkResponse({ description: 'Template type retrieved successfully' })
  async getType(@Param('typeId') typeId: string) {
    return this.templateTypesService.findOne(typeId);
  }

  @Get('settings')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'List all email templates for organization' })
  @ApiOkResponse({ description: 'Templates retrieved successfully' })
  async listSettings(
    @Query('templateTypeId') templateTypeId?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user: User = {} as User,
  ) {
    return this.templateSettingsService.findByOrganization(
      user.organizationId!,
      {
        templateTypeId,
        page: page ? parseInt(page) : 1,
        limit: limit ? parseInt(limit) : 20,
      },
    );
  }

  @Get('settings/:settingId')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Get a specific email template' })
  @ApiOkResponse({ description: 'Template retrieved successfully' })
  async getSetting(
    @Param('settingId') settingId: string,
    @CurrentUser() user: User,
  ) {
    return this.templateSettingsService.findOne(
      settingId,
      user.organizationId!,
    );
  }

  @Post('settings')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Create a new email template' })
  @ApiOkResponse({ description: 'Template created successfully' })
  async createSetting(
    @Body(new ZodValidationPipe(emailTemplateSchema))
    data: EmailTemplateSchema,
    @CurrentUser() user: User,
  ) {
    return this.templateSettingsService.create(user.organizationId!, {
      templateTypeId: data.templateTypeId,
      subject: data.subject,
      htmlContent: data.htmlContent,
      isActive: data.isActive,
    });
  }

  @Patch('settings/:settingId')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Update an email template' })
  @ApiOkResponse({ description: 'Template updated successfully' })
  async updateSetting(
    @Param('settingId') settingId: string,
    @Body(new ZodValidationPipe(emailTemplateSchema.partial()))
    data: Partial<EmailTemplateSchema>,
    @CurrentUser() user: User,
  ) {
    return this.templateSettingsService.update(
      settingId,
      user.organizationId!,
      {
        subject: data.subject,
        htmlContent: data.htmlContent,
        isActive: data.isActive,
      },
    );
  }

  @Delete('settings/:settingId')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Delete an email template' })
  @ApiOkResponse({ description: 'Template deleted successfully' })
  async deleteSetting(
    @Param('settingId') settingId: string,
    @CurrentUser() user: User,
  ) {
    return this.templateSettingsService.delete(settingId, user.organizationId!);
  }

  @Post('settings/:settingId/toggle')
  @Roles('ORG_ADMIN')
  @ApiOperation({ summary: 'Toggle email template active status' })
  @ApiOkResponse({ description: 'Template status toggled successfully' })
  async toggleActive(
    @Param('settingId') settingId: string,
    @CurrentUser() user: User,
  ) {
    return this.templateSettingsService.toggleActive(
      settingId,
      user.organizationId!,
    );
  }
}

import { Module } from '@nestjs/common';
import { EmailTemplateTypesService } from './email-template-types.service';
import { EmailTemplateSettingsService } from './email-template-settings.service';
import { EmailTemplatesController } from './email-templates.controller';

@Module({
  providers: [EmailTemplateTypesService, EmailTemplateSettingsService],
  controllers: [EmailTemplatesController],
  exports: [EmailTemplateTypesService, EmailTemplateSettingsService],
})
export class EmailTemplatesModule {}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UsePipes,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { Roles } from '../auth/decorators';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import {
  createDocumentRequestSchema,
  updateDocumentRequestSchema,
  type CreateDocumentRequest,
  type UpdateDocumentRequest,
  type DocumentResponse,
  type DocumentListResponse,
} from '@repo/contracts';
import { ZodValidationPipe } from '../common';

@Controller('organizations/:organizationId/documents')
@Roles('ORG_ADMIN', 'SUPER_ADMIN')
@UseGuards(OrganizationGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createDocumentRequestSchema))
  async create(
    @Param('organizationId') organizationId: string,
    @Body() createDocumentRequest: CreateDocumentRequest,
  ): Promise<DocumentResponse> {
    return this.documentsService.create(organizationId, createDocumentRequest);
  }

  @Get()
  async findAll(
    @Param('organizationId') organizationId: string,
    @Query('userId') userId?: string,
  ): Promise<DocumentListResponse> {
    return this.documentsService.findAll(organizationId, userId);
  }

  @Get(':id')
  async findOne(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<DocumentResponse> {
    return this.documentsService.findOne(organizationId, id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateDocumentRequestSchema))
  async update(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
    @Body() updateDocumentRequest: UpdateDocumentRequest,
  ): Promise<DocumentResponse> {
    return this.documentsService.update(
      organizationId,
      id,
      updateDocumentRequest,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.documentsService.remove(organizationId, id);
  }
}

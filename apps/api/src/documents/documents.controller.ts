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
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { Roles } from '../auth/decorators';
import { OrganizationGuard } from '../auth/guards/organization.guard';
import {
  updateDocumentRequestSchema,
  documentTypeSchema,
  type UpdateDocumentRequest,
  type DocumentResponse,
  type DocumentListResponse,
} from '@repo/contracts';
import { ZodValidationPipe } from '../common';

interface UploadedFileType {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Allowed file types: PDFs, images, and common document formats
const ALLOWED_FILE_TYPES = new RegExp(
  '^(application/pdf|image/(jpeg|png|gif|webp)|' +
    'application/(msword|vnd.openxmlformats-officedocument.wordprocessingml.document)|' +
    'text/plain)$',
);

@Controller('organizations/:organizationId/documents')
@Roles('ORG_ADMIN', 'SUPER_ADMIN')
@UseGuards(OrganizationGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('organizationId') organizationId: string,
    @Body('userId') userId: string,
    @Body('documentType') documentType: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: ALLOWED_FILE_TYPES }),
        ],
      }),
    )
    file: UploadedFileType,
  ): Promise<DocumentResponse> {
    if (!userId) {
      throw new BadRequestException('userId is required');
    }

    // Validate documentType
    const parseResult = documentTypeSchema.safeParse(documentType);
    if (!parseResult.success) {
      throw new BadRequestException('Invalid documentType');
    }

    return this.documentsService.upload(organizationId, {
      userId,
      documentType: parseResult.data,
      file,
    });
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

  @Get(':id/download')
  async getDownloadUrl(
    @Param('organizationId') organizationId: string,
    @Param('id') id: string,
  ): Promise<{ url: string; fileName: string }> {
    return this.documentsService.getDownloadUrl(organizationId, id);
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

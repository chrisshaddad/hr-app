import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { STORAGE_SERVICE, type StorageService } from '../storage';
import type {
  UpdateDocumentRequest,
  DocumentResponse,
  DocumentListResponse,
  DocumentType,
} from '@repo/contracts';

export interface UploadDocumentData {
  userId: string;
  documentType: DocumentType;
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
    size: number;
  };
}

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(STORAGE_SERVICE) private readonly storageService: StorageService,
  ) {}

  private async verifyDocumentExists(
    organizationId: string,
    id: string,
  ): Promise<{ fileKey: string }> {
    const existing = await this.prisma.document.findFirst({
      where: { id, organizationId, deletedAt: null },
      select: { id: true, fileUrl: true },
    });

    if (!existing) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    // Extract file key from URL
    const fileKey = existing.fileUrl.split('/').slice(-2).join('/');
    return { fileKey };
  }

  async upload(
    organizationId: string,
    data: UploadDocumentData,
  ): Promise<DocumentResponse> {
    // Upload file to storage
    const uploaded = await this.storageService.upload(data.file.buffer, {
      fileName: data.file.originalname,
      mimeType: data.file.mimetype,
      folder: `${organizationId}/${data.userId}`,
    });

    // Create document record
    return this.prisma.document.create({
      data: {
        userId: data.userId,
        organizationId,
        documentType: data.documentType,
        fileName: data.file.originalname,
        fileUrl: uploaded.key, // Store the key, not the full URL
        fileSize: uploaded.size,
        mimeType: uploaded.mimeType,
      },
    });
  }

  async findAll(
    organizationId: string,
    userId?: string,
  ): Promise<DocumentListResponse> {
    const where = {
      organizationId,
      deletedAt: null,
      ...(userId && { userId }),
    };

    const [documents, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        orderBy: { uploadedAt: 'desc' },
      }),
      this.prisma.document.count({ where }),
    ]);

    return { documents, total };
  }

  async findOne(organizationId: string, id: string): Promise<DocumentResponse> {
    const document = await this.prisma.document.findFirst({
      where: { id, organizationId, deletedAt: null },
    });

    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    return document;
  }

  async getDownloadUrl(
    organizationId: string,
    id: string,
    expiresInSeconds = 3600,
  ): Promise<{ url: string; fileName: string }> {
    const document = await this.findOne(organizationId, id);
    const url = await this.storageService.getSignedUrl(
      document.fileUrl,
      expiresInSeconds,
    );
    return { url, fileName: document.fileName };
  }

  async update(
    organizationId: string,
    id: string,
    data: UpdateDocumentRequest,
  ): Promise<DocumentResponse> {
    await this.verifyDocumentExists(organizationId, id);

    return this.prisma.document.update({
      where: { id },
      data,
    });
  }

  async remove(organizationId: string, id: string): Promise<void> {
    const { fileKey } = await this.verifyDocumentExists(organizationId, id);

    // Delete from storage
    try {
      await this.storageService.delete(fileKey);
    } catch (error) {
      // Log but don't fail if storage deletion fails
      console.error(`Failed to delete file from storage: ${fileKey}`, error);
    }

    // Soft delete record
    await this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

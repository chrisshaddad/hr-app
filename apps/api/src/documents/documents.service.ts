import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type {
  CreateDocumentRequest,
  UpdateDocumentRequest,
  DocumentResponse,
  DocumentListResponse,
} from '@repo/contracts';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  private async verifyDocumentExists(
    organizationId: string,
    id: string,
  ): Promise<void> {
    const existing = await this.prisma.document.findFirst({
      where: { id, organizationId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
  }

  async create(
    organizationId: string,
    data: CreateDocumentRequest,
  ): Promise<DocumentResponse> {
    return this.prisma.document.create({
      data: {
        userId: data.userId,
        organizationId,
        documentType: data.documentType,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
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
    await this.verifyDocumentExists(organizationId, id);

    // Soft delete
    await this.prisma.document.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAllByProject(projectId: string) {
    return this.prisma.document.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upload(projectId: string, file: Express.Multer.File, userId: string) {
    await this.assertProjectAccess(projectId, userId);

    const ext = file.originalname.split('.').pop();
    const path = `${projectId}/${uuidv4()}.${ext}`;
    const fileUrl = await this.storageService.upload('documents', file, path);

    return this.prisma.document.create({
      data: {
        fileName: file.originalname,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        projectId,
      },
    });
  }

  async remove(documentId: string, userId: string) {
    const doc = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { project: { select: { ownerId: true } } },
    });

    if (!doc) throw new NotFoundException('Document not found');
    if (doc.project.ownerId !== userId)
      throw new ForbiddenException('Only the project owner can delete documents');

    const urlParts = doc.fileUrl.split('/documents/');
    if (urlParts.length > 1) {
      await this.storageService.remove('documents', urlParts[1]);
    }

    await this.prisma.document.delete({ where: { id: documentId } });
    return { message: 'Document deleted successfully' };
  }

  private async assertProjectAccess(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { select: { userId: true } } },
    });

    if (!project) throw new NotFoundException('Project not found');

    const isOwner = project.ownerId === userId;
    const isMember = project.members.some((m) => m.userId === userId);

    if (!isOwner && !isMember) throw new ForbiddenException('Access denied');
  }
}

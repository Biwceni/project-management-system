import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AttachmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  async findAllByProject(projectId: string) {
    return this.prisma.attachment.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upload(
    projectId: string,
    file: Express.Multer.File,
    userId: string,
  ) {
    await this.assertProjectAccess(projectId, userId);

    const ext = file.originalname.split('.').pop();
    const path = `${projectId}/${uuidv4()}.${ext}`;
    const fileUrl = await this.storageService.upload(file, path);

    return this.prisma.attachment.create({
      data: {
        fileName: file.originalname,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        projectId,
      },
    });
  }

  async remove(attachmentId: string, userId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { project: { select: { ownerId: true } } },
    });

    if (!attachment) throw new NotFoundException('Attachment not found');
    if (attachment.project.ownerId !== userId)
      throw new ForbiddenException('Only the project owner can delete files');

    const urlParts = attachment.fileUrl.split('/project-files/');
    if (urlParts.length > 1) {
      await this.storageService.remove(urlParts[1]);
    }

    await this.prisma.attachment.delete({ where: { id: attachmentId } });
    return { message: 'Attachment deleted successfully' };
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

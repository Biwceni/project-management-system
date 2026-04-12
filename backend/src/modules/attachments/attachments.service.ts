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

  async findAllByTask(taskId: string) {
    return this.prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async upload(taskId: string, file: Express.Multer.File, userId: string) {
    await this.assertTaskAccess(taskId, userId);

    const ext = file.originalname.split('.').pop();
    const path = `tasks/${taskId}/${uuidv4()}.${ext}`;
    const fileUrl = await this.storageService.upload('attachments', file, path);

    return this.prisma.attachment.create({
      data: {
        fileName: file.originalname,
        fileUrl,
        fileSize: file.size,
        mimeType: file.mimetype,
        taskId,
      },
    });
  }

  async remove(attachmentId: string, userId: string) {
    const attachment = await this.prisma.attachment.findUnique({
      where: { id: attachmentId },
      include: { task: { select: { project: { select: { ownerId: true } } } } },
    });

    if (!attachment) throw new NotFoundException('Attachment not found');
    if (attachment.task.project.ownerId !== userId)
      throw new ForbiddenException('Only the project owner can delete files');

    const urlParts = attachment.fileUrl.split('/attachments/');
    if (urlParts.length > 1) {
      await this.storageService.remove('attachments', urlParts[1]);
    }

    await this.prisma.attachment.delete({ where: { id: attachmentId } });
    return { message: 'Attachment deleted successfully' };
  }

  private async assertTaskAccess(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          select: { ownerId: true, members: { select: { userId: true } } },
        },
      },
    });

    if (!task) throw new NotFoundException('Task not found');

    const isOwner = task.project.ownerId === userId;
    const isMember = task.project.members.some((m) => m.userId === userId);

    if (!isOwner && !isMember) throw new ForbiddenException('Access denied');
  }
}

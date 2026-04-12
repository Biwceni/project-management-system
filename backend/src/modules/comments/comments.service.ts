import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByTask(taskId: string, userId: string) {
    await this.assertTaskAccess(taskId, userId);

    return this.prisma.comment.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(taskId: string, dto: CreateCommentDto, userId: string) {
    await this.assertTaskAccess(taskId, userId);

    return this.prisma.comment.create({
      data: { content: dto.content, taskId, userId },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId)
      throw new ForbiddenException('You can only delete your own comments');

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Comment deleted successfully' };
  }

  private async assertTaskAccess(taskId: string, userId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: { select: { ownerId: true, members: { select: { userId: true } } } } },
    });

    if (!task) throw new NotFoundException('Task not found');

    const isOwner = task.project.ownerId === userId;
    const isMember = task.project.members.some((m) => m.userId === userId);

    if (!isOwner && !isMember) throw new ForbiddenException('Access denied');
  }
}

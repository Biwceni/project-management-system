import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, TaskStatus } from '@prisma/client';

@Injectable()
export class TasksRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByProject(projectId: string, status?: TaskStatus) {
    const where: Prisma.TaskWhereInput = { projectId };
    if (status) {
      where.status = status;
    }

    return this.prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: { id: true, name: true, ownerId: true },
        },
        assignee: { select: { id: true, name: true, email: true } },
        comments: {
          include: { user: { select: { id: true, name: true, email: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async create(data: Prisma.TaskCreateInput) {
    return this.prisma.task.create({
      data,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async update(id: string, data: Prisma.TaskUpdateInput) {
    return this.prisma.task.update({
      where: { id },
      data,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }
}

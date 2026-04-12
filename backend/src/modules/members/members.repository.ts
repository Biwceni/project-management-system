import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MemberRole } from '@prisma/client';

@Injectable()
export class MembersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByProject(projectId: string) {
    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findByProjectAndUser(projectId: string, userId: string) {
    return this.prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
    });
  }

  async add(projectId: string, userId: string, role: MemberRole) {
    return this.prisma.projectMember.create({
      data: { projectId, userId, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }

  async remove(projectId: string, userId: string) {
    return this.prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
    });
  }
}

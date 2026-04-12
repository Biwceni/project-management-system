import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MemberRole } from '@prisma/client';
import { MembersRepository } from './members.repository';
import { PrismaService } from '../prisma/prisma.service';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class MembersService {
  constructor(
    private readonly membersRepository: MembersRepository,
    private readonly prisma: PrismaService,
  ) {}

  async findAll(projectId: string, userId: string) {
    await this.assertAccess(projectId, userId);
    return this.membersRepository.findAllByProject(projectId);
  }

  async add(projectId: string, dto: AddMemberDto, userId: string) {
    await this.assertOwner(projectId, userId);

    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found with this email');
    }

    const existing = await this.membersRepository.findByProjectAndUser(
      projectId,
      targetUser.id,
    );

    if (existing) {
      throw new ConflictException('User is already a member');
    }

    return this.membersRepository.add(
      projectId,
      targetUser.id,
      dto.role || MemberRole.MEMBER,
    );
  }

  async remove(projectId: string, memberId: string, userId: string) {
    await this.assertOwner(projectId, userId);

    const member = await this.membersRepository.findByProjectAndUser(
      projectId,
      memberId,
    );

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    await this.membersRepository.remove(projectId, memberId);
    return { message: 'Member removed successfully' };
  }

  private async assertAccess(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');

    if (project.ownerId === userId) return;

    const member = await this.membersRepository.findByProjectAndUser(
      projectId,
      userId,
    );
    if (!member) throw new ForbiddenException('Access denied');
  }

  private async assertOwner(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== userId)
      throw new ForbiddenException('Only the project owner can manage members');
  }
}

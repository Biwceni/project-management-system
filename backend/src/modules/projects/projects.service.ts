import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async findAll(userId: string) {
    return this.projectsRepository.findAllByUser(userId);
  }

  async findOne(id: string, userId: string) {
    const project = await this.projectsRepository.findById(id);

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const isOwner = project.ownerId === userId;
    const isMember = project.members?.some((m) => m.user.id === userId);

    if (!isOwner && !isMember) {
      throw new ForbiddenException('Access denied');
    }

    return project;
  }

  async create(dto: CreateProjectDto, userId: string) {
    const key = dto.name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 4);

    return this.projectsRepository.create({
      name: dto.name,
      description: dto.description,
      key,
      owner: { connect: { id: userId } },
    });
  }

  async update(id: string, dto: UpdateProjectDto, userId: string) {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== userId)
      throw new ForbiddenException('Only the owner can edit the project');

    return this.projectsRepository.update(id, dto);
  }

  async remove(id: string, userId: string) {
    const project = await this.projectsRepository.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== userId)
      throw new ForbiddenException('Only the owner can delete the project');

    await this.projectsRepository.delete(id);
    return { message: 'Project deleted successfully' };
  }
}

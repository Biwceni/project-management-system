import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { TasksRepository } from './tasks.repository';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly tasksRepository: TasksRepository,
    private readonly projectsService: ProjectsService,
  ) {}

  async findAll(projectId: string, userId: string, status?: TaskStatus) {
    await this.projectsService.findOne(projectId, userId);
    return this.tasksRepository.findAllByProject(projectId, status);
  }

  async findOne(id: string, userId: string) {
    const task = await this.tasksRepository.findById(id);

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.project.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return task;
  }

  async create(dto: CreateTaskDto, userId: string) {
    await this.projectsService.findOne(dto.projectId, userId);

    return this.tasksRepository.create({
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      project: { connect: { id: dto.projectId } },
      ...(dto.assigneeId
        ? { assignee: { connect: { id: dto.assigneeId } } }
        : {}),
    });
  }

  async update(id: string, dto: UpdateTaskDto, userId: string) {
    await this.findOne(id, userId);

    const { assigneeId, ...rest } = dto;
    const data: Record<string, unknown> = { ...rest };

    if (assigneeId === null) {
      data.assignee = { disconnect: true };
    } else if (assigneeId) {
      data.assignee = { connect: { id: assigneeId } };
    }

    return this.tasksRepository.update(id, data);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.tasksRepository.delete(id);
    return { message: 'Task deleted successfully' };
  }
}

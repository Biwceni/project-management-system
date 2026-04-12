import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  private readonly defaultSelect: Prisma.UserSelect = {
    id: true,
    email: true,
    name: true,
    avatarUrl: true,
    createdAt: true,
  };

  async findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: this.defaultSelect,
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({
      where: { id },
      data,
      select: this.defaultSelect,
    });
  }
}

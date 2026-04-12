import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersRepository } from './users.repository';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getProfile(userId: string) {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateUserDto) {
    const data: Record<string, string> = {};

    if (dto.name) {
      data.name = dto.name;
    }

    if (dto.password) {
      data.password = await bcrypt.hash(dto.password, 10);
    }

    return this.usersRepository.update(userId, data);
  }
}

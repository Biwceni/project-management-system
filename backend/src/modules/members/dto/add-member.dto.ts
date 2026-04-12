import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { MemberRole } from '@prisma/client';

export class AddMemberDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsEnum(MemberRole)
  @IsOptional()
  role?: MemberRole;
}

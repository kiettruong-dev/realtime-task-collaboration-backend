import { TaskStatus } from '@/prisma/generated/enums';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @Length(1, 100, { message: 'Title must be between 1 and 100 characters' })
  title?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200, {
    message: 'Description must be between 1 and 200 characters',
  })
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus, { message: 'Invalid task status' })
  status?: TaskStatus;

  @IsNotEmpty()
  @IsInt({ message: 'Version must be an integer' })
  @Min(1, { message: 'Version must be >= 1' })
  version: number;
}

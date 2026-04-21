import {
  IsString,
  IsUUID,
  IsOptional,
  Length,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateTaskDto {
  @IsUUID()
  workspaceId: string;

  @IsNotEmpty({ message: 'Title is required' })
  @IsString()
  @Length(1, 100, { message: 'Title must be between 1 and 100 characters' })
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Description must be at most 255 characters' })
  description?: string;
}

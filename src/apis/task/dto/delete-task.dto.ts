import { IsInt, IsNotEmpty, Min } from 'class-validator';

export class DeleteTaskDto {
  @IsNotEmpty()
  @IsInt({ message: 'Version must be an integer' })
  @Min(1, { message: 'Version must be >= 1' })
  version: number;
}

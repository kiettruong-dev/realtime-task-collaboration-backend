import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateWorkspaceDto {
  @IsNotEmpty({ message: 'Workspace name is required' })
  @IsString()
  @Length(1, 100, {
    message: 'Workspace name must be between 1 and 100 characters',
  })
  name: string;
}

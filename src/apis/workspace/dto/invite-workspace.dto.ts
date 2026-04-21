import { IsEmail } from 'class-validator';

export class InviteWorkspaceDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;
}

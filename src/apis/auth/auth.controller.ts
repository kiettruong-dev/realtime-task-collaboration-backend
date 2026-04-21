import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { Request } from 'express';
import {
  CurrentUser,
  CurrentUserType,
} from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto.email, dto.password);
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@CurrentUser() currentuser: CurrentUserType) {
    return this.authService.login(currentuser);
  }

  @Get('profile')
  profile(@CurrentUser() currentuser: CurrentUserType) {
    return this.authService.profile(currentuser);
  }
}

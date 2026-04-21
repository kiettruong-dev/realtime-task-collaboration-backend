/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { SALT_ROUNDS } from '@/common/constants/auth';
import { CurrentUserType } from '@/common/decorators/current-user.decorator';
import { PrismaService } from '@/prisma/prisma.service';
import { ConflictException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { NotFoundError } from 'rxjs';
@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new ConflictException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new ConflictException('Invalid email or password');
    }

    return user;
  }

  async register(email: string, password: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hash,
      },
    });

    return { id: user.id, email: user.email };
  }

  login(currentuser: CurrentUserType) {
    const payload = { username: currentuser.email, sub: currentuser.id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async profile(currentuser: CurrentUserType) {
    try {
      const user = await this.prisma.user.findUniqueOrThrow({
        where: { id: currentuser.id },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });
      return user;
    } catch (error: any) {
      if (error.code === 'P2025') {
        throw new NotFoundError('User not found');
      }
      throw error;
    }
  }

  logout() {
    // For JWT-based authentication, logout is typically handled on the client side by deleting the token.
    // Optionally, you can implement token blacklisting here if needed.
    // For now, just return a success message.
    return { message: 'Logged out successfully' };
  }
}

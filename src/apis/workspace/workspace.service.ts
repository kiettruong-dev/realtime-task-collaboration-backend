import { CurrentUserType } from '@/common/decorators/current-user.decorator';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { WorkspaceMemberRole } from '@/common/enums/workspace.enum';
import { QueryWorkspaceDto } from './dto/query-workspace.dto';
import { calculatePagination } from '@/utils/helpers.util';
import { InviteWorkspaceDto } from './dto/invite-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prismaService: PrismaService) {}

  async createWorkspace(
    currentUser: CurrentUserType,
    { name }: CreateWorkspaceDto,
  ) {
    try {
      const workspace = await this.prismaService.workspace.create({
        data: {
          name,
          ownerId: currentUser.id,
          members: {
            create: {
              userId: currentUser.id,
              role: WorkspaceMemberRole.OWNER,
            },
          },
        },
      });

      return {
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.ownerId,
      };
    } catch (error) {
      throw error;
    }
  }

  async getWorkspacesForUser(
    currentUser: CurrentUserType,
    { page, pageSize }: QueryWorkspaceDto,
  ) {
    try {
      const { skip, limit } = calculatePagination(page, pageSize);
      const [workspaces, total] = await Promise.all([
        this.prismaService.workspace.findMany({
          where: {
            members: {
              some: {
                userId: currentUser.id,
              },
            },
          },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                  },
                },
              },
            },
          },
          skip,
          take: limit,
        }),
        this.prismaService.workspace.count({
          where: {
            members: {
              some: { userId: currentUser.id },
            },
          },
        }),
      ]);

      return {
        workspaces,
        pagination: {
          page,
          pageSize,
          total: total,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async inviteUserToWorkspace(
    currentUser: CurrentUserType,
    workspaceId: string,
    { email }: InviteWorkspaceDto,
  ) {
    try {
      const workspace = await this.prismaService.workspace.findUnique({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }
      const memberOwner = await this.prismaService.workspaceMember.findFirst({
        where: {
          workspaceId,
          userId: currentUser.id,
          role: WorkspaceMemberRole.OWNER,
        },
      });

      if (!memberOwner)
        throw new ForbiddenException(
          'You can only invite users to workspaces you own',
        );

      const user = await this.prismaService.user.findUnique({
        where: { email },
      });

      if (!user) throw new NotFoundException('User not found');

      const existing = await this.prismaService.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: user.id,
          },
        },
      });

      if (existing) {
        throw new ForbiddenException('User already in workspace');
      }

      const newMember = await this.prismaService.workspaceMember.create({
        data: {
          workspaceId,
          userId: user.id,
        },
      });
      return newMember;
    } catch (error: any) {
      throw error;
    }
  }
}

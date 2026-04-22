import { PrismaService } from '@/prisma/prisma.service';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { CurrentUserType } from '@/common/decorators/current-user.decorator';
import { QueryTaskDto } from './dto/query-task.dto';
import { calculatePagination } from '@/utils/helpers.util';
import { UpdateTaskDto } from './dto/update-task.dto';
import { WorkspaceMemberRole } from '@/common/enums/workspace.enum';
import { TaskStatus } from '@/common/enums/task.enum';
import { DeleteTaskDto } from './dto/delete-task.dto';
import { RealtimeGateway } from '@/gateways/realtime/realtime.gateway';

@Injectable()
export class TaskService {
  constructor(
    private readonly prismaService: PrismaService,
    private realtimeGateway: RealtimeGateway,
  ) {}

  private async checkMember(workspaceId: string, userId: string) {
    const member = await this.prismaService.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!member) {
      throw new ForbiddenException('Access denied');
    }

    return member;
  }
  async createTask(currentUser: CurrentUserType, createTaskDto: CreateTaskDto) {
    try {
      const { workspaceId, title, description } = createTaskDto;
      await this.checkMember(workspaceId, currentUser.id);

      const workspace = await this.prismaService.workspace.findUnique({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const task = await this.prismaService.task.create({
        data: {
          workspaceId: workspace.id,
          title: title,
          description: description,
          createdBy: currentUser.id,
        },
      });
      this.realtimeGateway.server
        .to(`workspace:${workspaceId}`)
        .emit('task_created', task);
      return task;
    } catch (error) {
      throw error;
    }
  }

  async getTaskByWorkspace(
    workspaceId: string,
    currentUser: CurrentUserType,
    { page, pageSize }: QueryTaskDto,
  ) {
    try {
      await this.checkMember(workspaceId, currentUser.id);
      const { skip, limit } = calculatePagination(page, pageSize);
      const [tasks, total] = await Promise.all([
        this.prismaService.task.findMany({
          where: {
            workspaceId: workspaceId,
          },
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prismaService.task.count({
          where: {
            workspaceId: workspaceId,
          },
        }),
      ]);

      return {
        tasks,
        pagination: {
          total,
          page,
          pageSize,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  async updateTask(
    currentUser: CurrentUserType,
    taskId: string,
    updateTaskDto: UpdateTaskDto,
  ) {
    try {
      const { title, description, status, version } = updateTaskDto;

      if (
        title === undefined &&
        description === undefined &&
        status === undefined
      ) {
        throw new BadRequestException('No data to update');
      }
      const task = await this.prismaService.task.findUnique({
        where: { id: taskId },
      });
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      if (task.status === TaskStatus.DONE) {
        throw new ForbiddenException('Cannot update a completed task');
      }
      const member = await this.checkMember(task.workspaceId, currentUser.id);
      const isCreator = task.createdBy === currentUser.id;
      const isOwner = member.role === WorkspaceMemberRole.OWNER;

      if (!isCreator && !isOwner) {
        if (title || description) {
          throw new ForbiddenException(
            'Only task creator or workspace owner can update title or description',
          );
        }
      }

      const result = await this.prismaService.task.updateMany({
        where: {
          id: taskId,
          version,
        },
        data: {
          ...(title !== undefined && { title }),
          ...(description !== undefined && { description }),
          ...(status !== undefined && { status }),
          version: { increment: 1 },
          updatedBy: currentUser.id,
        },
      });

      if (result.count === 0) {
        this.realtimeGateway.server
          .to(`workspace:${task.workspaceId}`)
          .emit('task_error', {
            type: 'CONFLICT',
            taskId,
            message: 'Task has been updated by another user',
          });
        throw new ConflictException(
          'Task has been updated by another user. Please refresh and try again.',
        );
      }

      const updatedTask = await this.prismaService.task.findUnique({
        where: { id: taskId },
      });
      this.realtimeGateway.server
        .to(`workspace:${task.workspaceId}`)
        .emit('task_updated', updatedTask);
      return updatedTask;
    } catch (error) {
      throw error;
    }
  }

  async deleteTask(
    currentUser: CurrentUserType,
    taskId: string,
    { version }: DeleteTaskDto,
  ) {
    try {
      const task = await this.prismaService.task.findUnique({
        where: { id: taskId },
      });
      if (!task) {
        throw new NotFoundException('Task not found');
      }

      const member = await this.checkMember(task.workspaceId, currentUser.id);
      const isCreator = task.createdBy === currentUser.id;
      const isOwner = member.role === WorkspaceMemberRole.OWNER;
      if (!isCreator && !isOwner) {
        throw new ForbiddenException(
          'Only task creator or workspace owner can delete the task',
        );
      }
      const result = await this.prismaService.task.deleteMany({
        where: { id: taskId, version: version },
      });
      if (result.count === 0) {
        throw new ConflictException(
          'Task has been updated or deleted by another user. Please refresh and try again.',
        );
      }
      this.realtimeGateway.server
        .to(`workspace:${task.workspaceId}`)
        .emit('task_deleted', taskId);
      return {
        message: 'Task deleted successfully',
      };
    } catch (error) {
      throw error;
    }
  }
}

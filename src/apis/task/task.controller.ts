import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import {
  CurrentUser,
  CurrentUserType,
} from '@/common/decorators/current-user.decorator';
import { QueryTaskDto } from './dto/query-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { DeleteTaskDto } from './dto/delete-task.dto';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  createTask(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.taskService.createTask(currentUser, createTaskDto);
  }

  @Get(':workspaceId')
  listTaskByWorkspace(
    @CurrentUser() user: CurrentUserType,
    @Param('workspaceId') workspaceId: string,
    @Query() query: QueryTaskDto,
  ) {
    return this.taskService.getTaskByWorkspace(workspaceId, user, query);
  }

  @Patch(':taskId')
  updateTask(
    @CurrentUser() user: CurrentUserType,
    @Param('taskId') taskId: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(user, taskId, updateTaskDto);
  }

  @Delete(':taskId')
  deleteTask(
    @CurrentUser() user: CurrentUserType,
    @Param('taskId') taskId: string,
    @Body() deleteTaskDto: DeleteTaskDto,
  ) {
    return this.taskService.deleteTask(user, taskId, deleteTaskDto);
  }
}

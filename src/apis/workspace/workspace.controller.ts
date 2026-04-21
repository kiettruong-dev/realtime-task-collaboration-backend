import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import {
  CurrentUser,
  CurrentUserType,
} from '@/common/decorators/current-user.decorator';
import { QueryWorkspaceDto } from './dto/query-workspace.dto';
import { InviteWorkspaceDto } from './dto/invite-workspace.dto';

@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  async createWorkspace(
    @CurrentUser() currentUser: CurrentUserType,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspaceService.createWorkspace(
      currentUser,
      createWorkspaceDto,
    );
  }

  @Get()
  async getWorkspacesForUser(
    @CurrentUser() currentUser: CurrentUserType,
    @Query() query: QueryWorkspaceDto,
  ) {
    return this.workspaceService.getWorkspacesForUser(currentUser, query);
  }

  @Post(':id/invite')
  invite(
    @CurrentUser() user: CurrentUserType,
    @Param('id') workspaceId: string,
    @Body() body: InviteWorkspaceDto,
  ) {
    return this.workspaceService.inviteUserToWorkspace(user, workspaceId, body);
  }
}

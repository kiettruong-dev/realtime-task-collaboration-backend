import { JwtPayload } from '@/apis/auth/strategies/jwt.strategy';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private jwtService: JwtService,
    private prismaService: PrismaService,
  ) {}
  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;

      const payload: JwtPayload = this.jwtService.verify(token);
      client.data.user = payload;
      client.join(`user:${payload.sub}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {}

  @SubscribeMessage('join_workspace')
  async handleJoinWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
    const user = client.data.user as JwtPayload;

    const isMember = await this.checkMember(data.workspaceId, user.sub);

    if (!isMember) {
      client.emit('error', 'Access denied');
      return;
    }

    client.join(`workspace:${data.workspaceId}`);
  }

  @SubscribeMessage('leave_workspace')
  handleLeaveWorkspace(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { workspaceId: string },
  ) {
    client.leave(`workspace:${data.workspaceId}`);
  }

  private async checkMember(workspaceId: string, userId: string) {
    const member = await this.prismaService.workspaceMember.findFirst({
      where: { workspaceId, userId },
    });

    return !!member;
  }
}

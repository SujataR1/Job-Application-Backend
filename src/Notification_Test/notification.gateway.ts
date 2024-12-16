import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private clientTokenMap: Map<string, string> = new Map(); // Map client.id -> token

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;

    if (token) {
      this.clientTokenMap.set(client.id, token);
      console.log(`Client connected with token: ${token}`);

      try {
        const notifications =
          await this.notificationService.getNotifications(token);
        client.emit('notifications', notifications);
      } catch (error) {
        console.error('Error fetching notifications:', error.message);
        client.emit('error', { message: 'Unauthorized or invalid token' });
        client.disconnect();
      }
    } else {
      console.error('No token provided, disconnecting client');
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.clientTokenMap.delete(client.id);
    console.log(`Client disconnected: ${client.id}`);
  }

  notifyUser(token: string, notification: any) {
    this.clientTokenMap.forEach((storedToken, clientId) => {
      if (storedToken === token) {
        this.server.to(clientId).emit('notification', notification);
      }
    });
  }
}

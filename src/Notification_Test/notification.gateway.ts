import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // Map to store client connections (client.id -> token)
  private clientTokenMap: Map<string, string> = new Map();

  constructor(private readonly notificationService: NotificationService) {}

  // On WebSocket connection
  async handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;

    if (token) {
      // Map the client ID to the token
      this.clientTokenMap.set(client.id, token);
      console.log(`Client connected with token: ${token}`);

      // Send the most recent 50 notifications on connect
      const notifications =
        await this.notificationService.getNotifications(token);
      client.emit('notifications', notifications);
    } else {
      console.error('No token provided, disconnecting client');
      client.disconnect();
    }
  }

  // On WebSocket disconnect
  handleDisconnect(client: Socket) {
    if (this.clientTokenMap.has(client.id)) {
      this.clientTokenMap.delete(client.id);
      console.log(`Client disconnected: ${client.id}`);
    }
  }

  // Notify a specific user when a new notification is created
  notifyUser(token: string, notification: any) {
    this.clientTokenMap.forEach((storedToken, clientId) => {
      if (storedToken === token) {
        this.server.to(clientId).emit('notification', notification);
      }
    });
  }
}

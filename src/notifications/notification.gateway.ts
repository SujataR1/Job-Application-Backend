import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { Utilities } from 'src/utils/Utilities';

@WebSocketGateway({
  namespace: '/live-notifications',
  cors: { origin: '*' },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  Notification_Server: Server;

  // Map userId -> Set of socket IDs
  private userSocketMap: Map<string, Set<string>> = new Map();

  constructor(
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService: NotificationService,
  ) {}

  // Handle WebSocket connection
  async handleConnection(client: Socket) {
    const token = client.handshake.query.token as string;

    if (token) {
      try {
        const decoded = await Utilities.VerifyJWT(token);
        const userId = decoded.id;

        // Add the client's socket ID to the user's socket set
        if (!this.userSocketMap.has(userId)) {
          this.userSocketMap.set(userId, new Set());
        }
        this.userSocketMap.get(userId).add(client.id);

        console.log(`User ${userId} connected with socket ID ${client.id}`);

        // Fetch the most recent 50 notifications
        const notifications =
          await this.notificationService.getNotifications(userId);
        client.emit('notifications', notifications);
      } catch (error) {
        console.error('Invalid token, disconnecting client:', error.message);
        client.disconnect();
      }
    } else {
      console.error('No token provided, disconnecting client');
      client.disconnect();
    }
  }

  // Handle WebSocket disconnection
  handleDisconnect(client: Socket) {
    // Remove the client's socket ID from the user's socket set
    for (const [userId, socketSet] of this.userSocketMap.entries()) {
      if (socketSet.has(client.id)) {
        socketSet.delete(client.id);
        console.log(`User ${userId} disconnected socket ID ${client.id}`);
        if (socketSet.size === 0) {
          this.userSocketMap.delete(userId);
        }
        break;
      }
    }
  }

  // Notify all sockets of a user when a new notification is created
  notifyUser(userId: string, notification: any) {
    const socketSet = this.userSocketMap.get(userId);
    if (socketSet) {
      for (const socketId of socketSet) {
        this.Notification_Server.to(socketId).emit(
          'notification',
          notification,
        );
      }
      console.log(`Notification sent to all sockets for user ${userId}`);
    } else {
      console.log(`No active sockets for user ${userId}`);
    }
  }
}

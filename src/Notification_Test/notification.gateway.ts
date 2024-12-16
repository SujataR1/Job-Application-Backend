import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { NotificationService } from './notification.service';
  
  @WebSocketGateway({
    cors: { origin: '*' },
  })
  export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private activeClients: Map<string, string> = new Map();
  
    constructor(private readonly notificationService: NotificationService) {}
  
    async handleConnection(client: Socket) {
      try {
        const token = client.handshake.query.token as string;
        const decoded = await this.notificationService.getNotifications(token); // Decoded at the service level
  
        const userId = decoded[0]?.userId; // Get userId for active connections
        this.activeClients.set(client.id, userId);
  
        console.log(`User ${userId} connected via WebSocket`);
      } catch (error) {
        console.error('Token invalid:', error.message);
        client.disconnect();
      }
    }
  
    handleDisconnect(client: Socket) {
      const userId = this.activeClients.get(client.id);
      if (userId) {
        this.activeClients.delete(client.id);
        console.log(`User ${userId} disconnected`);
      }
    }
  
    @SubscribeMessage('fetchNotifications')
    async fetchNotifications(client: Socket) {
      try {
        const token = client.handshake.query.token as string;
        const notifications = await this.notificationService.getNotifications(token);
        client.emit('notifications', notifications);
      } catch (error) {
        client.emit('error', { message: 'Unauthorized or invalid token' });
      }
    }
  }
  
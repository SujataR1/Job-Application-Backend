import {
    WebSocketGateway,
    OnGatewayConnection,
    OnGatewayDisconnect,
    WebSocketServer,
    SubscribeMessage,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { NotificationService } from './notification.service';
  
  @WebSocketGateway({
    cors: { origin: '*' }, // Adjust as per your environment
  })
  export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private activeClients: Map<string, string> = new Map();
  
    constructor(private readonly notificationService: NotificationService) {}
  
    handleConnection(client: Socket) {
      const userId = client.handshake.query.userId as string;
      if (userId) {
        this.activeClients.set(client.id, userId);
        console.log(`User ${userId} connected.`);
      }
    }
  
    handleDisconnect(client: Socket) {
      const userId = this.activeClients.get(client.id);
      if (userId) {
        this.activeClients.delete(client.id);
        console.log(`User ${userId} disconnected.`);
      }
    }
  
    async sendNotification(userId: string, title: string, content: string) {
      const clientId = [...this.activeClients.entries()].find(([, id]) => id === userId)?.[0];
      if (clientId) {
        this.server.to(clientId).emit('notification', { title, content });
      }
    }
  
    @SubscribeMessage('fetchNotifications')
    async fetchNotifications(client: Socket) {
      const userId = this.activeClients.get(client.id);
      if (userId) {
        const notifications = await this.notificationService.getNotifications(userId);
        client.emit('notifications', notifications);
      }
    }
  }
  
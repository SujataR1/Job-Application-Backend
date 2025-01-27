import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly gateway: NotificationGateway,
  ) {}

  async getNotifications(userId: string, limit: number = 50) {
    return this.prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async createNotification(userId: string, title: string, content: string) {
    // Create the notification in the database
    const notification = await this.prisma.notifications.create({
      data: { userId, title, content },
    });

    // Notify all active connections for this user
    this.gateway.notifyUser(userId, notification);

    return notification;
  }
}

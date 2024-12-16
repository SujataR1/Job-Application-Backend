import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(userId: string, title: string, content: string) {
    const notification = await this.prisma.notifications.create({
      data: {
        userId,
        title,
        content,
      },
    });

    return notification;
  }

  async getNotifications(userId: string) {
    return this.prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

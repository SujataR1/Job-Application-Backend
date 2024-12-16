import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Utilities } from '../utils/Utilities';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: NotificationGateway,
  ) {}

  // Decode the token to get the userId
  private async decodeToken(token: string): Promise<string> {
    try {
      const decoded = await Utilities.VerifyJWT(token);
      return decoded.id;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  // Fetch the most recent 50 notifications
  async getNotifications(token: string, limit: number = 50) {
    const userId = await this.decodeToken(token);

    return this.prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Create a new notification and notify the user in real-time
  async createNotification(token: string, title: string, content: string) {
    // Create the notification in the database
    const userId = await this.decodeToken(token);
    const notification = await this.prisma.notifications.create({
      data: { userId, title, content },
    });

    // Notify the user in real-time using their token
    this.gateway.notifyUser(userId, notification);

    return notification;
  }
}

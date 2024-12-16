import { Injectable, UnauthorizedException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Utilities } from '../utils/Utilities';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => NotificationGateway))
    private readonly gateway: NotificationGateway,
  ) {}

  private async decodeToken(token: string): Promise<string> {
    try {
      const decoded = await Utilities.VerifyJWT(token);
      return decoded.id;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getNotifications(token: string, limit: number = 50) {
    const userId = await this.decodeToken(token);

    return this.prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async createNotification(token: string, title: string, content: string) {
    const userId = await this.decodeToken(token)
    const notification = await this.prisma.notifications.create({
      data: { userId, title, content },
    });

    this.gateway.notifyUser(userId, notification);

    return notification;
  }
}

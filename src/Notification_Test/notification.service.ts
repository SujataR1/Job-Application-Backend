import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Utilities } from '../utils/Utilities';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  async createNotification(token: string, title: string, content: string) {
    const decoded = await Utilities.VerifyJWT(token);
    const userId = decoded.id; // Extract userId from decoded token

    return await this.prisma.notifications.create({
      data: { userId, title, content },
    });
  }

  async getNotifications(token: string) {
    const decoded = await Utilities.VerifyJWT(token);
    const userId = decoded.id;

    return await this.prisma.notifications.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

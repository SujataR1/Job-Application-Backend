import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';

@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly notificationGateway: NotificationGateway,
  ) {}

  @Post()
  async createNotification(
    @Body('userId') userId: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    const notification = await this.notificationService.createNotification(userId, title, content);
    await this.notificationGateway.sendNotification(userId, title, content);
    return notification;
  }

  @Get(':userId')
  async getUserNotifications(@Param('userId') userId: string) {
    const notifications = await this.notificationService.getNotifications(userId);
    return notifications;
  }
}

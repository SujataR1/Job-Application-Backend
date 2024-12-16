import { Controller, Post, Get, Body, Headers } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async createNotification(
    @Headers('Authorization') token: string,
    @Body('title') title: string,
    @Body('content') content: string,
  ) {
    return this.notificationService.createNotification(token, title, content);
  }

  @Get()
  async getUserNotifications(@Headers('Authorization') token: string) {
    return this.notificationService.getNotifications(token);
  }
}

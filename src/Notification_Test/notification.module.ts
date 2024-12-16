import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { PrismaService } from '../prisma.service';
import { NotificationController } from './notification.controller';

@Module({
  providers: [NotificationService, NotificationGateway, PrismaService],
  exports: [NotificationService],
  controllers:[NotificationController]
})
export class NotificationModule {}

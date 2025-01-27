import { Module, forwardRef } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationGateway } from './notification.gateway';
import { PrismaService } from '../prisma.service';

@Module({
  providers: [NotificationService, NotificationGateway, PrismaService],
  exports: [NotificationService],
})
export class NotificationModule {}

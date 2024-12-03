import { Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobsController } from './job.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [JobService, PrismaService],
  exports: [JobService],
  controllers: [JobsController], // Export JobService if you need to use it in other modules
})
export class JobModule {}

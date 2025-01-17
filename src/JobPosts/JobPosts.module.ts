import { Module } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service'; // Assuming PrismaService is already implemented
import { JobPostsService } from './jobposts.service';
import { JobPostsController } from './jobposts.controller';

@Module({
  imports: [],
  controllers: [JobPostsController],
  providers: [JobPostsService, PrismaService],
})
export class JobPostsModule {}

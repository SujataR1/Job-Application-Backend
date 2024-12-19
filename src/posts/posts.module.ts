import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PrismaService } from '../prisma.service'; // Assuming PrismaService is used for database interaction
import { Utilities } from '../utils/Utilities'; // Assuming Utilities contains helper methods like VerifyJWT

@Module({
  imports: [],
  controllers: [PostsController],
  providers: [PostsService, PrismaService, Utilities],
  exports: [PostsService], // Exporting PostsService if needed in other modules
})
export class PostsModule {}

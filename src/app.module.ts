import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { NotificationModule } from './notifications/notification.module';
import { PostsModule } from './posts/posts.module';
import { JobPostsModule } from './JobPosts/JobPosts.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UserSettingsModule,
    NotificationModule,
    PostsModule,
    JobPostsModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { NotificationModule } from './notifications/notification.module';
import { PostsModule } from './posts/posts.module';
import { JobPostsModule } from './JobPosts/JobPosts.module';
import { CompaniesModule } from './company/company.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UserSettingsModule,
    NotificationModule,
    PostsModule,
    CompaniesModule,
    JobPostsModule,
  ],
})
export class AppModule {}

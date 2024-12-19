// import { Module } from '@nestjs/common';
// import { AppController } from './app.controller';
// import { AppService } from './app.service';
// import { AuthModule } from './auth/auth.module';

// @Module({
//   imports: [AuthModule],
//   controllers: [AppController],
//   providers: [AppService],
// })
// export class AppModule {}

// src/app.module.ts
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from 'prisma/prisma.module';
import { UserSettingsModule } from './user-settings/user-settings.module';
import { NotificationModule } from './notifications/notification.module';
import { PostsModule } from './posts/posts.module';

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    UserSettingsModule,
    NotificationModule,
    PostsModule,
  ],
})
export class AppModule {}

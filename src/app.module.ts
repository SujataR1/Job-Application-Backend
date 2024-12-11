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
<<<<<<< HEAD
=======
import { UserSettingsModule } from './user-settings/user-settings.module';
>>>>>>> aa38f77c401ec041e88b62c1b27184af961b25f8

@Module({
  imports: [AuthModule, PrismaModule, UserSettingsModule],
})
export class AppModule {}

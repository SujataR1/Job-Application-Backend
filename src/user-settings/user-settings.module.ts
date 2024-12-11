import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Import PrismaService for database interaction
import { UserSettingsMethods } from './user-settings.service'; // Import the methods for user settings logic
import { UserSettingsController } from './user-settings.controller'; // Import the controller

@Module({
  controllers: [UserSettingsController], // Register the controller
  providers: [PrismaService, UserSettingsMethods], // Register PrismaService and methods as providers
})
export class UserSettingsModule {}

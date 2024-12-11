import { PrismaService } from '../prisma.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
  HttpStatus,
} from '@nestjs/common';
import { Utilities } from '../utils/utilities'; // Adjust path to your Utilities class
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Injectable()
export class UserSettingsMethods {
  constructor(private readonly prisma: PrismaService) {}

  // Retrieve user settings
  async getUserSettings(authorization: string) {
    const userId = await this.extractUserIdFromToken(authorization);
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      privateProfile: user.privateProfile,
      searchableProfile: user.searchableProfile,
      allowMessagesfromStrangers: user.allowMessagesfromStrangers,
      twoFaEnabled: user.twoFaEnabled,
      companyPageWriteAccess: user.companyPageWriteAccess,
      lookingToApply: user.lookingToApply,
      lookingToRecruit: user.lookingToRecruit,
    };
  }

  // Update user settings
  async updateUserSettings(
    authorization: string,
    settings: UpdateUserSettingsDto,
  ) {
    const userId = await this.extractUserIdFromToken(authorization);

    // Validate the settings for lookingToApply and lookingToRecruit
    if (settings.lookingToApply && settings.lookingToRecruit) {
      throw new BadRequestException(
        'Only one of lookingToApply or lookingToRecruit can be true.',
      );
    }

    // Update user settings in the database
    this.prisma.user.update({
      where: { id: userId },
      data: settings,
    });

    return `{"message":"Settings saved successfully!"}`;
  }

  // Extract user ID from JWT token using VerifyJWT
  private async extractUserIdFromToken(authorization: string): Promise<string> {
    const decoded = await Utilities.VerifyJWT(authorization); // Call your existing VerifyJWT method
    return decoded.id; // Extract the userId from the decoded payload
  }
}

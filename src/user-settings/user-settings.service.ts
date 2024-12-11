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

    // Fetch the user's current data for validation
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    // Validate the settings for lookingToApply and lookingToRecruit
    if (settings.lookingToApply && settings.lookingToRecruit) {
      throw new BadRequestException(
        'You can only either apply or recruit from one account, but not both.',
      );
    }

    // Ensure twoFaEnabled can only be true if emailVerified is true
    if (settings.twoFaEnabled && !user.emailVerified) {
      throw new BadRequestException(
        'Two-Factor Authentication can only be enabled if the email is verified.',
      );
    }

    // Determine userType based on the settings
    if (settings.lookingToApply) {
      settings['userType'] = 'Applicant'; // Assuming 'Applicant' is a valid value for userType
    } else if (settings.lookingToRecruit) {
      settings['userType'] = 'Recruiter'; // Assuming 'Recruiter' is a valid value for userType
    }

    // Update user settings in the database
    await this.prisma.user.update({
      where: { id: userId },
      data: settings,
    });

    return { message: 'Settings saved successfully!' };
  }

  // Extract user ID from JWT token using VerifyJWT
  private async extractUserIdFromToken(authorization: string): Promise<string> {
    const decoded = await Utilities.VerifyJWT(authorization); // Call your existing VerifyJWT method
    return decoded.id; // Extract the userId from the decoded payload
  }
}

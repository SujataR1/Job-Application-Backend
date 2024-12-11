import { PrismaService } from '../prisma.service';
import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Utilities } from '../utils/utilities';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Injectable()
export class UserSettingsMethods {
  constructor(private readonly prisma: PrismaService) {}

  // Retrieve user settings
  async getUserSettings(authorization: string) {
    const decoded = await Utilities.VerifyJWT(authorization);
    const userId = decoded.id;
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
    const decoded = await Utilities.VerifyJWT(authorization);
    const userId = decoded.id;

    // Fetch the user's current data for validation
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found.');
    }

    // Automatically enforce mutual exclusivity
    if (settings.lookingToApply === true) {
      if (!user.lookingToApply) {
        settings['lookingToRecruit'] = false; // Automatically flip the other flag if it was true
      }
      settings['userType'] = 'Applicant'; // Automatically set userType
    } else if (settings.lookingToRecruit === true) {
      if (!user.lookingToRecruit) {
        settings['lookingToApply'] = false; // Automatically flip the other flag if it was true
      }
      settings['userType'] = 'Recruiter'; // Automatically set userType
    }

    // Validate for conflicting true values
    if (
      settings.lookingToApply === true &&
      (settings.lookingToRecruit || user.lookingToRecruit)
    ) {
      throw new BadRequestException(
        'You can only either apply or recruit from one account, but not both.',
      );
    }

    if (
      settings.lookingToRecruit === true &&
      (settings.lookingToApply || user.lookingToApply)
    ) {
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

    // Update user settings in the database
    await this.prisma.user.update({
      where: { id: userId },
      data: settings,
    });

    return { message: 'Settings saved successfully!' };
  }
}

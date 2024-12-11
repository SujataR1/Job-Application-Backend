import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Utilities } from '../utils/Utilities';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update.dto';
import { OTPType } from '@prisma/client';
import { randomBytes } from 'crypto';
import { EmailType, sendEmail } from 'src/comms/methods';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    const {
      email,
      password,
      fullName,
      phoneNumber,
      userType,
      lookingToApply,
      lookingToRecruit,
      about,
      profileImage,
    } = signUpDto;

    // Check if the email is already in use
    const existingUserByEmail = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new ConflictException(
        'A user with this email already exists. Please use a different email.',
      );
    }

    // Check if the phone number is already in use (if provided)
    if (phoneNumber) {
      const existingUserByPhone = await this.prisma.user.findFirst({
        where: { phoneNumber },
      });

      if (existingUserByPhone) {
        throw new ConflictException(
          'A user with this phone number already exists. Please use a different phone number.',
        );
      }
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phoneNumber,
        userType,
        lookingToApply,
        lookingToRecruit,
        about,
        profilePicturePath: profileImage || null, // Store the file path or URL here
      },
    });

    if (!user) {
      throw new InternalServerErrorException(
        'Failed to create your account! This might be some issue on our end. Please sit tight while we try to fix it',
      );
    }

    return { message: 'Your account has been created successfully!' };
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;

    // Fetch user by email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException(
        'We seem to have no record with the entered credentials. Please signup first.',
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Please check the entered credentials');
    }

    // Check if two-factor authentication is enabled
    if (user.twoFaEnabled) {
      // Generate and send OTP for 2FA
      const otp = await this.generateOTP(email, OTPType.TwoFa);

      // Fetch user full name for email personalization
      const fullName = user.fullName;

      // Send 2FA email
      await sendEmail(email, fullName, EmailType.TwoFA, otp);

      // Return a 2FA pending response
      return res.status(200).json({
        message:
          'Two-Factor Authentication is enabled. Please check your email for the OTP to complete login.',
      });
    }

    // Generate the JWT token
    const payload = { id: user.id }; // Encode the user ID in the JWT payload
    const token = this.jwtService.sign(payload);

    // Encrypt the token
    const encryptedToken = Utilities.encryptToken(token);

    // Set the encrypted token and the user type in the appropriate headers
    res.setHeader('Authorization', `Bearer ${encryptedToken}`);
    res.setHeader('User_Type', `${user.userType}`);

    // Send the response
    return res.status(200).json({
      message: 'You have successfully logged in!',
    });
  }

  async logout(authorizationHeader: string) {
    // Use the VerifyJWT utility method to validate the token and get the payload
    const decoded = await Utilities.VerifyJWT(authorizationHeader);

    if (!decoded) {
      throw new InternalServerErrorException(
        'There has been an error on our end',
      );
    }

    // Add the token to the Blacklisted_Tokens table
    const token = authorizationHeader.split(' ')[1];
    await this.prisma.blacklisted_Tokens.create({
      data: {
        blacklistedToken: token,
      },
    });

    return {
      message: 'You have successfully logged out!',
    };
  }

  async updateUser(
    authorizationHeader: string, // Extract userId from the JWT in the Authorization header
    updateUserDto: UpdateUserDto,
  ) {
    const { email, ...allowedUpdates } = updateUserDto; // Exclude password

    // Verify the JWT and get the userId
    const decoded = await Utilities.VerifyJWT(authorizationHeader);
    const userId = decoded.id; // Extract userId from the token payload

    // Handle email updates
    if (email) {
      // Check if the email is already in use
      const existingUserByEmail = await this.prisma.user.findUnique({
        where: { email },
      });
      if (existingUserByEmail && existingUserByEmail.id !== userId) {
        throw new ConflictException(
          'A user with this email already exists. Please use a different email.',
        );
      }

      allowedUpdates['email'] = email; // Explicitly add email
      allowedUpdates['emailVerified'] = false; // Explicitly add emailVerified
      allowedUpdates['twoFaEnabled'] = false; // Explicitly add twoFaEnabled
    }

    try {
      // Update the user
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: allowedUpdates,
      });

      return {
        message: 'User information updated successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update user information. Please try again.',
      );
    }
  }

  async deleteUser(authorizationHeader: string, password: string) {
    // Verify the JWT and get the userId
    const decoded = await Utilities.VerifyJWT(authorizationHeader);
    const userId = decoded.id; // Extract userId from the token payload

    // Fetch the user to ensure they exist
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    // Verify the provided password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('You have entered an incorrect password');
    }

    try {
      // Delete the user
      await this.prisma.user.delete({ where: { id: userId } });

      // Add the token to the Blacklisted_Tokens table
      const token = authorizationHeader.split(' ')[1];
      await this.prisma.blacklisted_Tokens.create({
        data: {
          blacklistedToken: token,
        },
      });

      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to delete user. Please try again.',
      );
    }
  }

  private async generateOTP(email: string, otpType: OTPType): Promise<string> {
    // Find the user by email
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException(
        'An user with this email does not exist in our records.',
      );
    }

    // Ensure no duplicate OTPs exist for the same user and type
    await this.prisma.oTP.deleteMany({
      where: {
        userId: user.id,
        otpType,
      },
    });

    // Generate a random OTP
    const otp = randomBytes(3).toString('hex').toUpperCase(); // 6-character OTP

    // Define OTP expiry time (e.g., 10 minutes from now)
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 10);

    // Store the OTP in the database
    await this.prisma.oTP.create({
      data: {
        otp,
        otpType,
        userId: user.id,
        expiry,
      },
    });

    return otp; // Return the OTP for use in communications (e.g., email, SMS)
  }

  private async validateOTP(
    email: string,
    otp: string,
    otpType: OTPType,
  ): Promise<boolean> {
    // Find the user by email
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User with this email does not exist.');
    }

    // Find the OTP record
    const otpRecord = await this.prisma.oTP.findFirst({
      where: {
        userId: user.id,
        otp,
        otpType,
      },
    });

    if (!otpRecord) {
      throw new NotFoundException(
        'The OTP enetered did not match any in our records. Please Try Again',
      );
    }

    // Check if the OTP has expired
    const now = new Date();
    if (otpRecord.expiry < now) {
      // Delete expired OTP
      await this.prisma.oTP.delete({ where: { otp } });
      throw new UnauthorizedException('OTP has expired.');
    }

    // OTP is valid; delete it
    await this.prisma.oTP.delete({ where: { otp } });

    return true; // Return true if OTP is valid
  }

  async requestOTP(email: string, otpType: OTPType): Promise<string> {
    // Call the existing generateOTP method
    const otp = await this.generateOTP(email, otpType);

    // Determine the email type for sending the OTP
    let emailType: EmailType;
    switch (otpType) {
      case OTPType.PasswordReset:
        emailType = EmailType.PasswordReset;
        break;
      case OTPType.TwoFa:
        emailType = EmailType.TwoFA;
        break;
      case OTPType.EmailVerification:
        emailType = EmailType.EmailVerification;
        break;
      default:
        throw new Error('Invalid OTP type provided');
    }

    // Fetch user information for the email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with this email does not exist.');
    }

    // Send the OTP via email
    await sendEmail(user.email, user.fullName, emailType, otp);

    return 'OTP has been sent successfully!';
  }

  async verifyEmailOTP(
    authorizationHeader: string,
    otp: string,
  ): Promise<string> {
    // Verify the JWT and extract user ID
    const decoded = await Utilities.VerifyJWT(authorizationHeader);
    const userId = decoded.id; // Extract userId from the token payload

    // Fetch the user by ID
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Validate the OTP for EmailVerification type
    const isValid = await this.validateOTP(
      user.email,
      otp,
      OTPType.EmailVerification,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP.');
    }

    // Update the emailVerified field for the user
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    return 'Email has been successfully verified!';
  }

  async verifyTwoFaOTP(
    email: string,
    otp: string,
    res: Response,
  ): Promise<string> {
    // Validate the OTP for Two-Factor Authentication
    const isValid = await this.validateOTP(email, otp, OTPType.TwoFa);

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP.');
    }

    // Fetch the user by email
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Generate the JWT token
    const payload = { id: user.id }; // Encode the user ID in the JWT payload
    const token = this.jwtService.sign(payload);

    // Encrypt the token
    const encryptedToken = Utilities.encryptToken(token);

    // Set the encrypted token and the user type in the appropriate headers
    res.setHeader('Authorization', `Bearer ${encryptedToken}`);
    res.setHeader('User_Type', `${user.userType}`);

    return 'You have successfully logged in via Two-Factor Authentication!';
  }

  async toggle2FA(authorizationHeader: string): Promise<string> {
    // Verify the JWT and extract user ID
    const decoded = await Utilities.VerifyJWT(authorizationHeader);
    const userId = decoded.id; // Extract userId from the token payload

    // Fetch the user by ID
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Check if the user's email is verified
    if (!user.emailVerified) {
      throw new UnauthorizedException(
        'Two-Factor Authentication can only be toggled if your email is verified.',
      );
    }

    // Toggle the 2FA status
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { twoFaEnabled: !user.twoFaEnabled },
    });

    // Return a success message
    if (updatedUser.twoFaEnabled) {
      return 'Two-Factor Authentication has been enabled.';
    } else {
      return 'Two-Factor Authentication has been disabled.';
    }
  }

  async verifyPasswordResetOTP(
    email: string,
    newPassword: string,
    otp: string,
  ): Promise<string> {
    // Validate the OTP for PasswordReset type
    const isValid = await this.validateOTP(email, otp, OTPType.PasswordReset);

    if (!isValid) {
      throw new UnauthorizedException('Invalid or expired OTP.');
    }

    // Fetch the user by email
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await this.prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return '{"message":"Your password has been successfully reset."}';
  }

  async getUserDetails(authorizationHeader: string) {
    // Extract and validate the JWT token
    const decoded = await Utilities.VerifyJWT(authorizationHeader);
    const userId = decoded.id;

    // Fetch user details from the database
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { company: true }, // Assuming a company relation exists
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    // Encode profile picture to Base64 with MIME type if it exists
    let profilePicture = null;
    if (user.profilePicturePath) {
      try {
        profilePicture = await Utilities.encodeFileToBase64(
          user.profilePicturePath,
        );
      } catch (error) {
        console.error('Error encoding profile picture:', error);
        // Profile picture issues are logged but do not block the response
      }
    }

    // Return user details
    return {
      fullName: user.fullName,
      email: user.email,
      about: user.about,
      phoneNumber: user.phoneNumber,
      company: user.company ? user.company.name : 'None', // Return "None" if no company is associated
      profilePicture, // Encoded Base64 string or null
    };
  }

  async getUserProfilePicture(authorization: string) {
    const decoded = await Utilities.VerifyJWT(authorization); // Verify JWT and extract user ID
    const userId = decoded.id;

    // Fetch the user's profile picture path
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { profilePicturePath: true }, // Only fetch the profilePicturePath
    });

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    // Return null if no profile picture is set
    if (!user.profilePicturePath) {
      return null;
    }

    // Convert the profile picture to Base64
    try {
      const base64Image = await Utilities.encodeFileToBase64(
        user.profilePicturePath,
      );
      return { profilePicture: base64Image };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to retrieve profile picture.',
      );
    }
  }
}

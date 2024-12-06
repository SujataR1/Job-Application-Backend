import {
  Injectable,
  InternalServerErrorException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { Utilities } from '../utils/Utilities';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update.dto';

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
        profilePicturePath: profileImage, // Store the file path or URL here
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

    // Generate the JWT token
    const payload = { id: user.id }; // Encode the user ID in the JWT payload
    const token = this.jwtService.sign(payload);

    // Encrypt the token
    const encryptedToken = Utilities.encryptToken(token);

    // Set the encrypted token in the Authorization header
    res.setHeader('Authorization', `Bearer ${encryptedToken}`);

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

      // If the email is being changed, add email and emailVerified to allowedUpdates
      allowedUpdates['email'] = email; // Explicitly add email
      allowedUpdates['emailVerified'] = false; // Explicitly add emailVerified
    }

    try {
      // Update the user
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: allowedUpdates,
      });

      return {
        message: 'User information updated successfully',
        updatedFields: allowedUpdates,
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
}

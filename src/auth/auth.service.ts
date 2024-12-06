import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express'; // Import Express Response
import { Utilities } from '../utils/Utilities';
import * as bcrypt from 'bcrypt';

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
    } = signUpDto;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        phoneNumber,
        userType: userType,
        lookingToApply,
        lookingToRecruit,
        about, // Store the file path or URL here
      },
    });

    if (!user) {
      throw new InternalServerErrorException('Failed to create your account!');
    }

    return { message: 'Your account has been created successfully!' };
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new Error('No user was found with the entered credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Wrong password');

    // Generate the JWT token
    const payload = { id: user.id }; // Encode the user ID in the JWT payload
    const token = this.jwtService.sign(payload);

    // Set the token in the Authorization header
    res.setHeader('Authorization', `Bearer ${token}`);

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
}

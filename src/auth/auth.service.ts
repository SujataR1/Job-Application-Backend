import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async signUp(signUpDto: SignUpDto) {
    const {
      email,
      password,
      fullName,
      phoneNumber,
      userType,
      lookingToApply,
      lookingToRecruit,
    } = signUpDto;

    // Hash the password before storing it
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
        lookingToRecruit, // Store the file path or URL here
      },
    });

    // Return the formatted response excluding the password field
    return {
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
      lookingForApply: lookingForApply === 'yes' ? '1' : '0', // If the input is 'yes', return "1"
      lookingForRecruit: user.lookingForRecruit,  // Return the boolean directly
      profileImage: user.profileImage,  // Assuming profileImage is the file path or URL saved by multer
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find the user in the database by email
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    // Compare the provided password with the hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');

    // Return a successful login response excluding the password
    return {
      message: 'Login successful',
      user: {
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        userType: user.userType,
        lookingForRecruit: user.lookingForRecruit,
        profileImage: user.profileImage,
      },
    };
  }
}

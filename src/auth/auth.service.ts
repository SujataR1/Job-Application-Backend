import { Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { SignUpDto } from './dto/sign-up.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express'; // Import Express Response
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
        lookingToRecruit, // Store the file path or URL here
      },
    });

    return { message: 'User created successfully!' };
  }

  async login(loginDto: LoginDto, res: Response) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');

    // Generate the JWT token
    const payload = { id: user.id }; // Encode the user ID in the JWT payload
    const token = this.jwtService.sign(payload);

    // Set the token in the Authorization header
    res.setHeader('Authorization', `Bearer ${token}`);

    // Send the response
    return res.status(200).json({
      message: 'Login successful!',
    });
  }
}

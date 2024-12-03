// // src/auth/auth.service.ts
// import { Injectable } from '@nestjs/common';
// import { PrismaService } from 'prisma/prisma.service';
// import { SignUpDto } from './dto/sign-up.dto';
// import { LoginDto } from './dto/login.dto';  // Import LoginDto here
// import * as bcrypt from 'bcrypt';
// import { JwtService } from '@nestjs/jwt';
// import { Express } from 'express';
// import * as path from 'path';
// import * as fs from 'fs';

// @Injectable()
// export class AuthService {
//   constructor(
//     private prisma: PrismaService, // Inject PrismaService
//     private jwtService: JwtService,  // Inject JwtService
//   ) {}

//   // Sign Up
//   async signUp(signUpDto: SignUpDto) {
//     const { email, password, profileImage, ...rest } = signUpDto;

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     let imageUrl = null;
//     if (profileImage) {
//       // If there is a profile image, store it
//       // Generate a unique filename and save the file to your desired location
//       const fileName = `${Date.now()}-${profileImage.originalname}`;
//       const uploadPath = path.join(__dirname, '..', '..', 'uploads', fileName);

//       // Save the file (you may use a cloud service instead)
//       fs.writeFileSync(uploadPath, profileImage.buffer); // For local file saving

//       // Generate the URL or file path to store in the database
//       imageUrl = `/uploads/${fileName}`; // Local path or URL for your file
//     }

//     // Create user in the database with the file path (or URL)
//     const user = await this.prisma.user.create({
//       data: {
//         email,
//         password: hashedPassword,
//         profileImage: imageUrl, // Store the file path or URL here
//         ...rest,
//       },
//     });

//     return { message: 'User created successfully', user };
//   }

//   // Login
//   async login(loginDto: LoginDto) {
//     const { email, password } = loginDto;

//     // Find user by email
//     const user = await this.prisma.user.findUnique({ where: { email } });

//     if (!user) {
//       throw new Error('User not found');
//     }

//     // Check if password matches
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       throw new Error('Invalid password');
//     }

//     // Generate JWT token using JwtService
//     const payload = { userId: user.id, email: user.email };
//     const token = this.jwtService.sign(payload, { expiresIn: '1h' });

//     return { message: 'Login successful', token };
//   }
// }

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

    return { message: 'User created successfully', user };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('User not found');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw new Error('Invalid password');

    return { message: 'Login successful', user };
  }
}

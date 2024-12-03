// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'prisma/prisma.service'; // or wherever your PrismaService is defined
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule here

@Module({
  imports: [
    JwtModule.register({
      // Configure JwtModule (optional, but good for custom settings)
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '24h' }, // Example setting for token expiration
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}

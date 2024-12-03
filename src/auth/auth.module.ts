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
      secret:
        'd4e599e8e1db19c20eafb7723e78cb0f2d1811eb3b3aeb497fc04cba176073827f4cdac43e5d59da569a4a3bacf1ebdf923048c6ccd699ce071443d0639c5975', // Replace with your own secret key
      signOptions: { expiresIn: '1h' }, // Example setting for token expiration
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}

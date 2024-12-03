import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client'; // Import Prisma Client
import { UnauthorizedException, NotFoundException } from '@nestjs/common';

export class Utilities {
  private static jwtService = new JwtService({
    secret: process.env.JWT_SECRET, // Use your secret key
  });

  private static prisma = new PrismaClient(); // Initialize Prisma Client

  /**
   * Verifies the JWT from the Authorization header
   * @param authorizationHeader - The Authorization header containing the Bearer token
   * @returns The decoded token payload
   * @throws UnauthorizedException if the token is missing, invalid, expired, or blacklisted
   */
  static async VerifyJWT(authorizationHeader: string): Promise<any> {
    if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException(
        'Could not find your session information. Please log in again.',
      );
    }

    const token = authorizationHeader.split(' ')[1]; // Extract token
    if (!token) {
      throw new UnauthorizedException(
        'Something went wrong with your session information. Please log in again.',
      );
    }

    // Check if the token is blacklisted
    const isBlacklisted = await this.prisma.blacklisted_Tokens.findUnique({
      where: { blacklistedToken: token },
    });

    if (isBlacklisted) {
      throw new UnauthorizedException(
        'Your session has expired. Please log in again.',
      );
    }

    try {
        // Verify and decode the token
        const decoded = this.jwtService.verify(token);
  
        // Ensure the user exists in the database
        const user = await this.prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) {
          throw new NotFoundException('We seem to have no records of you.!');
        }
  
        return decoded; // Return the decoded payload
      } catch (error) {
        throw new UnauthorizedException(
          'Your session has either expired or there is an issue on our end. Please try logging in again.',
        );
      }
  }
}

import { diskStorage } from 'multer';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client'; // Import Prisma Client
import * as fs from 'fs';
import * as path from 'path';
import {
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';

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
      throw new NotFoundException(
        'Could not find your session information. Please log in again.',
      );
    }

    const token = authorizationHeader.split(' ')[1]; // Extract token
    if (!token) {
      throw new NotFoundException(
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
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
      });
      if (!user) {
        throw new NotFoundException('We seem to have no records of you.!');
      }

      return decoded; // Return the decoded payload
    } catch (error) {
      throw new InternalServerErrorException(
        'Either your session has expired or there is an issue on our end. Please try logging in again.',
      );
    }
  }

  /**
   * Ensures a directory exists or creates it recursively if it doesn't.
   * @param directoryPath - The path of the directory to check or create
   */
  static ensureDirectoryExists(directoryPath: string): void {
    const resolvedPath = path.resolve(directoryPath);
    if (!fs.existsSync(resolvedPath)) {
      fs.mkdirSync(resolvedPath, { recursive: true }); // Recursively create the directory
    }
  }

  /**
   * Deletes a file if it exists.
   * @param filePath - The path of the file to delete
   */
  static deleteFileIfExists(filePath: string): void {
    const resolvedPath = path.resolve(filePath);
    if (fs.existsSync(resolvedPath)) {
      fs.unlinkSync(resolvedPath);
    }
  }

  /**
   * Generates a unique file name based on the original file name and current timestamp.
   * @param originalFileName - The original name of the uploaded file
   * @returns A unique file name
   */
  static generateUniqueFileName(originalFileName: string): string {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(originalFileName);
    const baseName = path.basename(originalFileName, ext);
    return `${baseName}-${uniqueSuffix}${ext}`;
  }

  /**
   * Validates the MIME type of an uploaded file.
   * @param file - The uploaded file
   * @param allowedTypes - Array of allowed MIME types
   * @throws UnauthorizedException if the file type is not allowed
   */
  static validateFileType(
    file: Express.Multer.File,
    allowedTypes: string[],
  ): void {
    if (!allowedTypes.includes(file.mimetype)) {
      throw new UnauthorizedException('Unsupported file type');
    }
  }

  /**
   * Factory function for configuring Multer dynamically based on the destination folder.
   * @param folder - The destination folder for uploads
   * @returns Multer configuration object
   */
  static multerSetup(folder: string) {
    return {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = `./Media/${folder}`;
          Utilities.ensureDirectoryExists(uploadPath); // Ensure the directory exists
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueName = Utilities.generateUniqueFileName(
            file.originalname,
          );
          callback(null, uniqueName); // Generate a unique filename
        },
      }),
      fileFilter: (req, file, callback) => {
        try {
          Utilities.validateFileType(file, [
            'image/jpeg',
            'image/png',
            'image/gif',
          ]); // Validate MIME type
          callback(null, true);
        } catch (error) {
          callback(error, false); // Reject unsupported file types
        }
      },
      limits: {
        fileSize: 5000 * 1024, // 500 KB file size limit
      },
    };
  }
}

import { diskStorage } from 'multer';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client'; // Import Prisma Client
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import {
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as sharp from 'sharp';

export class Utilities {
  private static jwtService = new JwtService({
    secret: process.env.JWT_SECRET, // Use your secret key
  });

  private static prisma = new PrismaClient(); // Initialize Prisma Client
  private static readonly ENCRYPTION_KEY = process.env.JWT_ENCRYPTION_KEY; // Must be 32 bytes
  private static readonly IV_LENGTH = 16; // AES Initialization Vector length

  /**
   * Encrypts the given token using AES-256-CBC.
   * @param token - The JWT token to encrypt
   * @returns The encrypted token
   */
  static encryptToken(token: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH); // Generate random IV
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.ENCRYPTION_KEY, 'utf8'),
      iv,
    );
    let encrypted = cipher.update(token, 'utf8', 'hex'); // Specify input and output encoding
    encrypted += cipher.final('hex'); // Append final encrypted data
    return `${iv.toString('hex')}:${encrypted}`; // Return IV and encrypted token
  }

  /**
   * Decrypts the given encrypted token using AES-256-CBC.
   * @param encryptedToken - The encrypted JWT token
   * @returns The decrypted JWT token
   */
  static decryptToken(encryptedToken: string): string {
    const [iv, encrypted] = encryptedToken.split(':'); // Split IV and encrypted data
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(this.ENCRYPTION_KEY, 'utf8'),
      Buffer.from(iv, 'hex'),
    );
    let decrypted = decipher.update(encrypted, 'hex', 'utf8'); // Specify input and output encoding
    decrypted += decipher.final('utf8'); // Append final decrypted data
    return decrypted; // Return the decrypted token
  }

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

    const encryptedToken = authorizationHeader.split(' ')[1]; // Extract encrypted token
    if (!encryptedToken) {
      throw new NotFoundException(
        'Something went wrong with your session information. Please log in again.',
      );
    }

    // Check if the token is blacklisted
    const isBlacklisted = await this.prisma.blacklisted_Tokens.findUnique({
      where: { blacklistedToken: encryptedToken }, // Check the original encrypted token
    });

    if (isBlacklisted) {
      throw new UnauthorizedException(
        'Your session has expired. Please log in again.',
      );
    }

    // Decrypt the token
    let decryptedToken: string;
    try {
      decryptedToken = Utilities.decryptToken(encryptedToken); // Decrypt the token
    } catch (error) {
      throw new UnauthorizedException(
        'Invalid or corrupted token. Please log in again.',
      );
    }

    try {
      // Verify and decode the decrypted token
      const decoded = this.jwtService.verify(decryptedToken);

      // Ensure the user exists in the database
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
      });
      if (!user) {
        throw new NotFoundException('We seem to have no records of you.');
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
      fileFilter: async (req, file, callback) => {
        try {
          // Validate MIME type
          Utilities.validateFileType(file, [
            'image/jpeg',
            'image/png',
            'image/gif',
          ]);

          // Validate resolution using sharp
          const buffer = await file.stream.pipe(sharp().metadata());
          const { width, height } = buffer;

          const maxWidth = 414; // Example max width
          const maxHeight = 532; // Example max height

          if (width > maxWidth || height > maxHeight) {
            return callback(
              new Error(
                `Image resolution exceeds the allowed limit of ${maxWidth}x${maxHeight}px. Your image is ${width}x${height}px.`,
              ),
              false,
            );
          }

          callback(null, true);
        } catch (error) {
          callback(error, false); // Reject invalid images
        }
      },
      limits: {
        fileSize: 5000 * 1024, // 500 KB file size limit
      },
    };
  }
}

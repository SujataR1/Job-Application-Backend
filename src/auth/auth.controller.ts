import {
  Controller,
  Post,
  Patch,
  Delete,
  Res,
  Body,
  Headers,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { UpdateUserDto } from './dto/update.dto'; // Import Update DTO
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginDto } from './dto/login.dto'; // Import LoginDto
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { Utilities } from '../utils/utilities';

@ApiTags('Authentication') // Swagger tag for grouping
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Sign-up endpoint with file upload handling
  @Post('sign-up')
  @ApiOperation({
    summary: 'User Sign-Up',
    description:
      'This endpoint allows a user to sign up by providing personal details and an optional profile image.',
  })
  @UseInterceptors(
    FileInterceptor('profileImage', Utilities.multerSetup('Users')),
  ) // Interceptor for file handling
  @ApiConsumes('multipart/form-data') // Swagger annotation for handling file uploads
  @ApiBody({
    description: 'Sign-up form data with optional profile image',
    type: SignUpDto,
  })
  @ApiResponse({
    status: 201,
    description: 'User successfully signed up.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data.',
  })
  async signUp(
    @Body() signUpDto: SignUpDto, // DTO for request body
    @UploadedFile() profileImage: Express.Multer.File, // Correct type for uploaded file
  ) {
    if (profileImage) {
      signUpDto.profileImage = profileImage.path; // Save filename or path to DTO
    }

    return this.authService.signUp(signUpDto); // Process the sign-up logic
  }

  // Login endpoint
  @Post('login')
  @ApiOperation({
    summary: 'User Login',
    description:
      'This endpoint allows a user to log in by providing email and password.',
  })
  @ApiBody({
    description: 'Login credentials',
    type: LoginDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials.',
  })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return this.authService.login(loginDto, res);
  }

  // Logout endpoint
  @Post('logout')
  @ApiOperation({
    summary: 'Logout User',
    description:
      'Logs out the user by validating the token in the Authorization header and adding it to the blacklist to prevent further use.',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful. The token is blacklisted.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid, expired, or blacklisted token.',
  })
  async logout(@Headers('authorization') authorizationHeader: string) {
    try {
      return await this.authService.logout(authorizationHeader);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  // Update User endpoint
  @Patch('update')
  @ApiOperation({
    summary: 'Update user information',
    description: 'Updates the user information, except passwords.',
  })
  @UseInterceptors(
    FileInterceptor('profileImage', Utilities.multerSetup('Users')),
  ) // Interceptor for file handling
  @ApiConsumes('multipart/form-data') // Swagger annotation for handling file uploads
  @ApiHeader({
    name: 'authorization',
    description: 'Bearer token for authentication',
  })
  @ApiBody({
    description: 'Fields to update (excluding password)',
    type: UpdateUserDto, // Specify the DTO explicitly for Swagger
  })
  @ApiResponse({
    status: 200,
    description: 'User information updated successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or bad input.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token or authentication failed.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async updateUser(
    @Headers('authorization') authorizationHeader: string,
    @UploadedFile() profileImage: Express.Multer.File,
    @Body() updateUserDto: UpdateUserDto, // DTO for fields to update
  ) {
    if (profileImage) {
      updateUserDto.profileImage = profileImage.path; // Save filename or path to DTO
    }
    return this.authService.updateUser(authorizationHeader, updateUserDto);
  }

  // Delete User endpoint
  @Delete('delete')
  @ApiOperation({
    summary: 'Delete user account',
    description:
      'Deletes the account of a logged on the event of a succesful password verification.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
  })
  @ApiBody({
    description: 'User password for confirmation',
    schema: {
      type: 'object',
      properties: {
        password: {
          type: 'string',
          example: 'userPassword123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or bad input.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid token or incorrect password.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
  })
  async deleteUser(
    @Headers('Authorization') authorizationHeader: string,
    @Body('password') password: string, // Password confirmation
  ) {
    return this.authService.deleteUser(authorizationHeader, password);
  }
}

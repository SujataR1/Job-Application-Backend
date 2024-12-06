import {
  Controller,
  Post,
  Res,
  Body,
  Headers,
  UseInterceptors,
  UploadedFile,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginDto } from './dto/login.dto'; // Import LoginDto
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
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
  async logout(@Headers('Authorization') authorizationHeader: string) {
    try {
      return await this.authService.logout(authorizationHeader);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}

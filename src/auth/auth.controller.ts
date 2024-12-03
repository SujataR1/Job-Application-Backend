import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginDto } from './dto/login.dto'; // Import LoginDto
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';

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
  @UseInterceptors(FileInterceptor('profileImage')) // Interceptor for file handling
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
      signUpDto.profileImage = profileImage.filename; // Save filename or path to DTO
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
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}

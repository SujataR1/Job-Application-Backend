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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Sign-up endpoint with file upload handling
  @Post('sign-up')
  @UseInterceptors(FileInterceptor('profileImage')) // Interceptor for file handling
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
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}

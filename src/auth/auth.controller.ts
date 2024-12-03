import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
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
  @UseInterceptors(FileInterceptor('profileImage'))
  async signUp(@Body() signUpDto: SignUpDto, @UploadedFile() file: Express.Multer.File) {
    // If a profile image is uploaded, attach it to the DTO
    if (file) {
      signUpDto.profileImage = file.path; // Or however you want to handle the file path
    }
    return this.authService.signUp(signUpDto);
  }

  // Login endpoint
  @Post('login')  
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
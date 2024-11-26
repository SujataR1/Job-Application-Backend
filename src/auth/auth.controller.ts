import { Controller, Post, Body, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { LoginDto } from './dto/login.dto'; // Import LoginDto

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Sign-up endpoint with file upload handling
  @Post('sign-up')
  @UseInterceptors(FileInterceptor('profileImage'))  // Handle file upload for profile image
  async signUp(@Body() signUpDto: SignUpDto, @UploadedFile() profileImage: Express.Multer.File) {
    if (profileImage) {
      signUpDto.profileImage = profileImage.filename;  // Save the filename or path to DB (depending on your logic)
    }
    return this.authService.signUp(signUpDto);
  }

  // Login endpoint
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}



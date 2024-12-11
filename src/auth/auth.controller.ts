import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Headers,
  Res,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { UpdateUserDto } from './dto/update.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { Verify2FADto } from './dto/verify-two-fa.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { FileInterceptor } from '@nestjs/platform-express';
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

@ApiTags('Authentication') // Swagger group
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Sign-up endpoint
  @Post('sign-up')
  @ApiOperation({
    summary: 'User Sign-Up',
    description:
      'Allows a user to sign up with details and an optional profile image.',
  })
  @UseInterceptors(
    FileInterceptor('profileImage', Utilities.multerSetup('Users')),
  )
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Sign-up form data with optional profile image',
    type: SignUpDto,
  })
  @ApiResponse({ status: 201, description: 'User successfully signed up.' })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async signUp(
    @Body() signUpDto: SignUpDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    if (profileImage) {
      signUpDto.profileImage = profileImage.path;
    }
    return this.authService.signUp(signUpDto);
  }

  // Login endpoint
  @Post('login')
  @ApiOperation({
    summary: 'User Login',
    description: 'Allows a user to log in with email and password.',
  })
  @ApiBody({
    description: 'Login credentials',
    type: LoginDto,
  })
  @ApiResponse({ status: 200, description: 'Login successful.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    return this.authService.login(loginDto, res);
  }

  // Logout endpoint
  @Post('logout')
  @ApiOperation({
    summary: 'Logout User',
    description: 'Logs out the user by invalidating their token.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
  })
  @ApiResponse({
    status: 200,
    description: 'Logout successful. Token blacklisted.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token.',
  })
  async logout(@Headers('Authorization') authorizationHeader: string) {
    return this.authService.logout(authorizationHeader);
  }

  // Update user information
  @Patch('update')
  @ApiOperation({
    summary: 'Update User Information',
    description: 'Allows a user to update their profile information.',
  })
  @UseInterceptors(
    FileInterceptor('profileImage', Utilities.multerSetup('Users')),
  )
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
  })
  @ApiBody({
    description: 'Fields to update (excluding password)',
    type: UpdateUserDto,
  })
  @ApiResponse({
    status: 200,
    description: 'User information updated successfully.',
  })
  @ApiResponse({ status: 400, description: 'Invalid input data.' })
  async updateUser(
    @Headers('Authorization') authorizationHeader: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() profileImage: Express.Multer.File,
  ) {
    if (profileImage) {
      updateUserDto.profilePicturePath = profileImage.path;
    }
    return this.authService.updateUser(authorizationHeader, updateUserDto);
  }

  // Delete user
  @Delete('delete')
  @ApiOperation({
    summary: 'Delete User Account',
    description: 'Deletes a user account after password verification.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
  })
  @ApiBody({
    description: 'Password required for confirmation',
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', example: 'userPassword123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User account deleted successfully.',
  })
  async deleteUser(
    @Headers('Authorization') authorizationHeader: string,
    @Body('password') password: string,
  ) {
    return this.authService.deleteUser(authorizationHeader, password);
  }

  @Post('request-otp')
  @ApiOperation({
    summary: 'Request OTP',
    description:
      'Allows a user to request OTPs for various purposes like email verification, 2FA, or password reset.',
  })
  @ApiBody({
    description: 'Details for requesting an OTP',
    type: RequestOtpDto,
  })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async requestOtp(@Body() requestOtpDto: RequestOtpDto) {
    const { email, otpType } = requestOtpDto; // Extract email and OTP type from the request body
    const message = await this.authService.requestOTP(email, otpType); // Call the service to generate and send OTP
    return { message };
  }

  @Post('verify-email-otp')
  @ApiOperation({
    summary: 'Verify Email OTP',
    description:
      'Validates an email verification OTP, updates emailVerified using Authorization header.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
  })
  @ApiBody({
    description: 'OTP for email verification',
    type: VerifyEmailDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Email successfully verified.',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired OTP.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async verifyEmailOTP(
    @Headers('Authorization') authorizationHeader: string,
    @Body() verifyEmailDto: VerifyEmailDto,
  ) {
    const { otp } = verifyEmailDto; // Extract OTP from the request body
    return this.authService.verifyEmailOTP(authorizationHeader, otp); // Pass the Authorization header and OTP to the service
  }

  // Verify 2FA OTP
  @Post('verify-2fa-otp')
  @ApiOperation({
    summary: 'Verify 2FA OTP',
    description:
      'Validates the OTP sent for Two-Factor Authentication (2FA) based on the email provided.',
  })
  @ApiBody({
    description: '2FA OTP verification details',
    type: Verify2FADto,
  })
  @ApiResponse({
    status: 200,
    description: '2FA OTP verified successfully. User logged in.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired OTP.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async verifyTwoFa(@Body() verify2FADto: Verify2FADto, @Res() res: Response) {
    const { email, otp } = verify2FADto;
    const message = await this.authService.verifyTwoFaOTP(email, otp, res);
    return { message };
  }

  // Reset password
  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset Password',
    description: 'Allows resetting a user password using OTP.',
  })
  @ApiBody({
    description: 'Password reset details',
    type: ResetPasswordDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Password successfully reset.',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    const { email, otp, newPassword } = resetPasswordDto;
    return this.authService.verifyPasswordResetOTP(email, newPassword, otp);
  }

  @Post('toggle-2fa')
  @ApiOperation({
    summary: 'Toggle Two-Factor Authentication',
    description:
      'Enables or disables Two-Factor Authentication (2FA) for the authenticated user. The user must have a verified email to enable 2FA.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: '2FA toggled successfully. Returns the current 2FA status.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Email not verified or invalid token.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async toggle2FA(@Headers('Authorization') authorizationHeader: string) {
    return this.authService.toggle2FA(authorizationHeader);
  }

  @Get('user-details')
  @ApiOperation({
    summary: 'Get User Details',
    description:
      'Fetch user details based on the provided authorization token.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns user details, including profile picture encoded in Base64.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async getUserDetails(@Headers('Authorization') authorizationHeader: string) {
    return this.authService.getUserDetails(authorizationHeader);
  }

  @Get('profile-picture')
  @ApiOperation({ summary: 'Get user profile picture' })
  @ApiResponse({
    status: 200,
    description: 'User profile picture retrieved successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve profile picture.',
  })
  async getUserProfilePicture(@Headers('Authorization') authorization: string) {
    return this.authService.getUserProfilePicture(authorization);
  }
}

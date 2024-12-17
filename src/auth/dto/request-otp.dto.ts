import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail, IsEnum } from 'class-validator';
import { OTPType } from '@prisma/client';

export class RequestOtpDto {
  @ApiProperty({
    description: 'The email associated with the account',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'The type of OTP being requested',
    enum: OTPType, // This will show the enum values in Swagger
    example: OTPType.EmailVerification,
  })
  @IsEnum(OTPType)
  @IsNotEmpty()
  otpType: OTPType;
}

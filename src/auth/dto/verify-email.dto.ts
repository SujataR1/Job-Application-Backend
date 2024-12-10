import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'The OTP sent for email verification',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class Verify2FADto {
  @ApiProperty({
    description: 'The OTP sent for Two-Factor Authentication',
    example: '654321',
  })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiProperty({
    description: 'The email of said user',
    example: '654321',
  })
  @IsString()
  @IsNotEmpty()
  email: string;
}

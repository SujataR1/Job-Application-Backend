import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'Email address of the user' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Password for the account' })
  @IsString()
  password: string;
}

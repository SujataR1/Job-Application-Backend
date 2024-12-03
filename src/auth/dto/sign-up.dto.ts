import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserType } from '@prisma/client';
import { Transform } from 'class-transformer';

export class SignUpDto {
  @ApiProperty({ description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '+1234567890',
  })
  @IsPhoneNumber(null)
  @IsOptional()
  phoneNumber?: string;

  @ApiProperty({ description: 'Password for the account' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    description: "Type of user ('Applicant' or 'Recruiter')",
    enum: UserType, // Enum values for Swagger documentation
  })
  @IsEnum(UserType) // Assuming 'applicant' or 'recruiter' are valid user types
  @IsNotEmpty()
  userType: UserType;

  @ApiPropertyOptional({
    description: 'Whether the user is looking to apply for jobs',
    example: false,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true; // Convert "true" string to true
    if (value === 'false') return false; // Convert "false" string to false
    return value; // Leave actual booleans untouched
  })
  @IsOptional()
  @IsBoolean()
  lookingToApply?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the user is looking to recruit candidates',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true; // Convert "true" string to true
    if (value === 'false') return false; // Convert "false" string to false
    return value; // Leave actual booleans untouched
  })
  @IsOptional()
  @IsBoolean()
  lookingToRecruit: boolean;

  @ApiPropertyOptional({
    description: 'Profile image filename or path (optional)',
    type: 'string',
    format: 'binary',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  profileImage?: string; // Optional since a profile image can be null
}

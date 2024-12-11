import { IsString, IsOptional, IsBoolean, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class UpdateUserDto {
  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiPropertyOptional({
    description: 'Phone number of the user',
    example: '+1234567890',
  })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({
    description: 'A brief about section for the user',
    example: 'I am a software engineer with 5 years of experience.',
  })
  @IsString()
  @IsOptional()
  about?: string;

  @ApiPropertyOptional({
    description: 'Whether the user is looking to apply for jobs',
    example: true,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true; // Convert "true" string to true
    if (value === 'false') return false; // Convert "false" string to false
    return value; // Leave actual booleans untouched
  })
  @IsBoolean()
  @IsOptional()
  lookingToApply?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the user is looking to recruit candidates',
    example: false,
  })
  @Transform(({ value }) => {
    if (value === 'true') return true; // Convert "true" string to true
    if (value === 'false') return false; // Convert "false" string to false
    return value; // Leave actual booleans untouched
  })
  @IsBoolean()
  @IsOptional()
  lookingToRecruit?: boolean;

  @ApiPropertyOptional({
    description: 'Profile image filename or path (optional)',
    type: 'string',
    format: 'binary',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  profilePicturePath?: string; // Optional since a profile image can be null
}

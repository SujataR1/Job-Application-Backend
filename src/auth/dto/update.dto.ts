import { IsString, IsOptional, IsBoolean } from 'class-validator';
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
  @Transform(({ value }) => value === 'true' || value === true) // Transform string 'true' to boolean true
  @IsBoolean()
  @IsOptional()
  lookingToApply?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the user is looking to recruit candidates',
    example: false,
  })
  @Transform(({ value }) => value === 'true' || value === true) // Transform string 'true' to boolean true
  @IsBoolean()
  @IsOptional()
  lookingToRecruit?: boolean;

  @ApiPropertyOptional({
    description: 'Path to the user’s profile picture',
    example: '/uploads/profile_pictures/user123.jpg',
  })
  @IsString()
  @IsOptional()
  profilePicturePath?: string;
}

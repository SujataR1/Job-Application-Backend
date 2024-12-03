import {
  IsString,
  IsEmail,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  IsPhoneNumber,
  IsEnum,
} from 'class-validator';
import { UserType } from '@prisma/client';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber(null)
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(UserType) // Assuming 'applicant' or 'recruiter' are the only valid user types
  @IsNotEmpty()
  userType: UserType;

  @IsBoolean()
  @IsOptional() // Optional field, since it may be empty for some users
  lookingToApply?: boolean;

  @IsBoolean()
  @IsOptional()
  lookingToRecruit?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  profileImage?: string; // Optional, since profile image can be null
}

// // src/auth/dto/sign-up.dto.ts
// import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, IsOptional } from 'class-validator';

// export class SignUpDto {
//   @IsNotEmpty()
//   fullName: string;

//   @IsEmail()
//   email: string;

//   @IsPhoneNumber()
//   phoneNumber: string;

//   @IsString()
//   password: string;

//   @IsString()
//   userType: string;

//   lookingForApply: boolean;
//   lookingForRecruit: boolean;

//   // Add this property to allow storing the profile image path (optional)
//   @IsOptional()
//   profileImage?: string;  // This will hold the file path or URL of the uploaded image
// }

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

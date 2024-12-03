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

  @IsEnum(['Applicant', 'Recruiter']) // Assuming 'applicant' or 'recruiter' are the only valid user types
  @IsNotEmpty()
  userType: string;

  @IsString()
  @IsOptional() // Optional field, since it may be empty for some users
  lookingForApply?: boolean;

  @IsBoolean()
  @IsOptional()
  lookingForRecruit?: boolean;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  profileImage?: string; // Optional, since profile image can be null
}

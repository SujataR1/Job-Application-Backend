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

// sign-up.dto.ts
  // Assuming lookingForRecruit is a boolean



import { IsString, IsEmail, IsOptional, IsBoolean, IsNotEmpty, IsEnum, Matches } from 'class-validator';

const phoneNumberRegex = /^[0-9+\-()]*$/;

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Matches(phoneNumberRegex, {
    message: 'phoneNumber must be a valid phone number (including international with + or local)',
  })
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsEnum(['applicant', 'recruiter'])
  @IsNotEmpty()
  userType: string;


  @IsString()
  @IsOptional()
  lookingForApply?: string; // This should accept strings like "0", "1"

  @IsBoolean()
  @IsNotEmpty()
  lookingForRecruit: boolean;


  @IsOptional()
  @IsString()
  @IsNotEmpty()
  profileImage?: string;
}


// POST:Response: signup
// {
//   "fullName": "Johnn Doe",
//   "email": "johndoe1@example.com",
//   "password": "securePassword1233",
//   "phoneNumber": "1234567890",
//   "userType": "applicant",
//   "lookingForApply": "1",
//   "lookingForRecruit": false,
//   "profileImage": "path/to/image.jpg"
// }


// //login-POST
// { 
//   "email": "johndoe1@example.com",
//   "password": "securePassword1233"
// }
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateUserSettingsDto {
  @IsBoolean()
  @IsOptional()
  privateProfile?: boolean;

  @IsBoolean()
  @IsOptional()
  searchableProfile?: boolean;

  @IsBoolean()
  @IsOptional()
  allowMessagesfromStrangers?: boolean;

  @IsBoolean()
  @IsOptional()
  twoFaEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  companyPageWriteAccess?: boolean;

  @IsBoolean()
  @IsOptional()
  lookingToApply?: boolean;

  @IsBoolean()
  @IsOptional()
  lookingToRecruit?: boolean;
}

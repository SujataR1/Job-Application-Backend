import { IsString } from 'class-validator';

export class IndustryDto {
  @IsString()
  industryName: string;
}

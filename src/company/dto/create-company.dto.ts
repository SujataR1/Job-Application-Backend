import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, MaxLength } from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({
    description: 'The name of the company',
    maxLength: 255,
    example: 'TechCorp',
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({
    description: 'A brief description of the company',
    maxLength: 500,
    example:
      'A leading software solutions provider specializing in AI and cloud services.',
  })
  @IsString()
  @MaxLength(500)
  description: string;

  @ApiPropertyOptional({
    description: 'The official website link of the company',
    example: 'https://www.techcorp.com',
  })
  @IsOptional()
  @IsUrl()
  websiteLink?: string;

  @ApiPropertyOptional({
    description: 'Additional information about the company',
    example:
      'Founded in 2000, TechCorp has won numerous awards for innovation.',
  })
  @IsOptional()
  @IsString()
  about?: string;
}

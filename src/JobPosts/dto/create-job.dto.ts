import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsUUID,
} from 'class-validator';

export class CreateJobDto {
  @ApiProperty({
    description: 'Title of the job posting',
    example: 'Senior Software Engineer',
  })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Summary of the job posting',
    example: 'A brief summary of the job.',
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiProperty({
    description: 'Detailed description of the job posting',
    example: 'We are looking for a skilled software engineer to join our team.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Job locations in JSON format',
    example: ['Remote', 'New York'],
  })
  @IsNotEmpty()
  @IsArray()
  locations: any;

  @ApiPropertyOptional({
    description: 'Job address in JSON format',
    example: { street: '123 Main St', city: 'New York', zip: '10001' },
  })
  @IsOptional()
  address?: any;

  @ApiProperty({
    description: 'Skills required for the job in JSON format',
    example: ['JavaScript', 'NestJS', 'TypeScript'],
  })
  @IsNotEmpty()
  @IsArray()
  skills: any;

  @ApiPropertyOptional({
    description: 'Job requirements in JSON format',
    example: ['Bachelor’s degree in Computer Science', '5 years of experience'],
  })
  @IsOptional()
  requirements?: any;

  @ApiPropertyOptional({
    description: 'Minimum experience required for the job in years',
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  min_experience?: number;

  @ApiPropertyOptional({
    description: 'Maximum experience allowed for the job in years',
    example: 5,
  })
  @IsOptional()
  @IsNumber()
  max_experience?: number;

  @ApiPropertyOptional({
    description: 'Minimum salary offered for the job in INR',
    example: 500000,
  })
  @IsOptional()
  @IsNumber()
  min_salary?: number;

  @ApiPropertyOptional({
    description: 'Maximum salary offered for the job in INR',
    example: 1200000,
  })
  @IsOptional()
  @IsNumber()
  max_salary?: number;

  @ApiPropertyOptional({
    description: 'Company ID associated with the job',
    example: 'company-uuid-123',
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsUUID,
} from 'class-validator';

export class UpdateJobDto {
  @ApiPropertyOptional({
    description: 'Title of the job posting',
    example: 'Senior Software Engineer',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Summary of the job posting',
    example: 'A brief summary of the job.',
  })
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the job posting',
    example: 'Updated job description goes here.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Job locations in JSON format',
    example: ['Remote', 'San Francisco'],
  })
  @IsOptional()
  @IsArray()
  locations?: any;

  @ApiPropertyOptional({
    description: 'Job address in JSON format',
    example: { street: '456 Elm St', city: 'San Francisco', zip: '94103' },
  })
  @IsOptional()
  address?: any;

  @ApiPropertyOptional({
    description: 'Skills required for the job in JSON format',
    example: ['Python', 'Django', 'React'],
  })
  @IsOptional()
  @IsArray()
  skills?: any;

  @ApiPropertyOptional({
    description: 'Job requirements in JSON format',
    example: ['10 years of experience', 'Expertise in distributed systems'],
  })
  @IsOptional()
  requirements?: any;

  @ApiPropertyOptional({
    description: 'Minimum experience required for the job in years',
    example: 3,
  })
  @IsOptional()
  @IsNumber()
  min_experience?: number;

  @ApiPropertyOptional({
    description: 'Maximum experience allowed for the job in years',
    example: 7,
  })
  @IsOptional()
  @IsNumber()
  max_experience?: number;

  @ApiPropertyOptional({
    description: 'Minimum salary offered for the job in INR',
    example: 600000,
  })
  @IsOptional()
  @IsNumber()
  min_salary?: number;

  @ApiPropertyOptional({
    description: 'Maximum salary offered for the job in INR',
    example: 1500000,
  })
  @IsOptional()
  @IsNumber()
  max_salary?: number;

  @ApiPropertyOptional({
    description: 'Company ID associated with the job',
    example: 'updated-company-uuid-789',
  })
  @IsOptional()
  @IsUUID()
  companyId?: string;
}

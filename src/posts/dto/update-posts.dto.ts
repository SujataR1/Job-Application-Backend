import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdatePostDto {
  @ApiPropertyOptional({
    description: 'New title of the post',
    example: 'Updated Title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'New content of the post',
    example: 'Updated content here.',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'New visibility for the post',
    enum: ['Everyone', 'Connections', 'OnlyMe'],
  })
  @IsOptional()
  @IsEnum(['Everyone', 'Connections', 'OnlyMe'])
  visibility?: 'Everyone' | 'Connections' | 'OnlyMe';

  @ApiPropertyOptional({
    description: 'Allow or disallow sharing',
    example: 'true',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true) // Convert "true"/"false" to boolean
  @IsBoolean()
  allowSharing?: boolean;

  @ApiPropertyOptional({
    description: 'Allow or disallow reposting',
    example: 'false',
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true) // Convert "true"/"false" to boolean
  @IsBoolean()
  allowReposts?: boolean;
}

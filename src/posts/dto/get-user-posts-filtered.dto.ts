import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetUserPostsFiltersDto {
  @ApiPropertyOptional({ description: 'Filter by visibility', enum: ['Everyone', 'Connections', 'OnlyMe'] })
  @IsOptional()
  @IsEnum(['Everyone', 'Connections', 'OnlyMe'])
  visibility?: 'Everyone' | 'Connections' | 'OnlyMe';

  @ApiPropertyOptional({ description: 'Filter by allowing reposts', example: 'true' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true) // Convert "true"/"false" to boolean
  @IsBoolean()
  allowReposts?: boolean;

  @ApiPropertyOptional({ description: 'Filter by allowing sharing', example: 'true' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true) // Convert "true"/"false" to boolean
  @IsBoolean()
  allowSharing?: boolean;
}

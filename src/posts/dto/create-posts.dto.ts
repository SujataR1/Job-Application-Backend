import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePostDto {
  @ApiProperty({ description: 'Title of the post', example: 'My First Post' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Content of the post', example: 'This is a post with attachments.' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Visibility of the post', enum: ['Everyone', 'Connections', 'OnlyMe'] })
  @IsOptional()
  @IsEnum(['Everyone', 'Connections', 'OnlyMe'])
  visibility?: 'Everyone' | 'Connections' | 'OnlyMe';

  @ApiPropertyOptional({ description: 'Allow others to share the post', example: 'true' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true) // Convert "true"/"false" to boolean
  @IsBoolean()
  allowSharing?: boolean;

  @ApiPropertyOptional({ description: 'Allow others to repost', example: 'false' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true) // Convert "true"/"false" to boolean
  @IsBoolean()
  allowReposts?: boolean;
}

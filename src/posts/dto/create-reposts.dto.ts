import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RepostDto {
  @ApiProperty({ description: 'Original post ID for the repost', example: '1234-abcd' })
  @IsString()
  originalPostId: string;
}

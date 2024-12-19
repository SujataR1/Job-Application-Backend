import { ApiProperty } from '@nestjs/swagger';
import { PostVisibilityEnum } from '@prisma/client';
import { IsString } from 'class-validator';

export class RepostDto {
  @ApiProperty({
    description: 'Original post ID for the repost',
    example: '1234-abcd',
  })
  @IsString()
  originalPostId: string;

  @ApiProperty({
    description: 'Post Visibility',
    example: 'Everyone',
  })
  @IsString()
  postVisibility: PostVisibilityEnum;
}

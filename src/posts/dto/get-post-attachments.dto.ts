import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class GetPostAttachmentsDto {
  @ApiProperty({ description: 'ID of the post', example: '1234-abcd' })
  @IsString()
  postId: string;
}

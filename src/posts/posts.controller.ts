import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Headers,
  UseInterceptors,
  UploadedFiles,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { CreatePostDto } from './dto/create-posts.dto';
import { UpdatePostDto } from './dto/update-posts.dto';
import { GetUserPostsFiltersDto } from './dto/get-user-posts-filtered.dto';
import { RepostDto } from './dto/create-reposts.dto';
import { PostsService } from './posts.service';
import * as multer from 'multer';
import { PostVisibilityEnum } from '@prisma/client';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  private readonly uploadMiddleware = multer.diskStorage({
    destination: 'uploads/posts',
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
  });

  /**
   * Create a new post with optional attachments
   */
  @Post('create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a post with optional attachments' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePostDto })
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      storage: multer.diskStorage({
        destination: 'Media/Posts',
        filename: (req, file, cb) =>
          cb(null, `${Date.now()}-${file.originalname}`),
      }),
    }),
  )
  async createPost(
    @Headers('Authorization') token: string,
    @Body() createPostDto: CreatePostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const filePaths = files.map((file) => file.path);
    return this.postsService.createPost(token, createPostDto, filePaths);
  }

  /**
   * Update a specific post
   */
  @Patch(':postId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update specific details of a post' })
  @ApiBody({ type: UpdatePostDto })
  async updatePost(
    @Headers('Authorization') token: string,
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postsService.updatePost(token, postId, updatePostDto);
  }

  /**
   * Get all posts by the authenticated user
   */
  @Get('user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all posts by the authenticated user' })
  async getPostsByUser(
    @Headers('Authorization') token: string,
    @Body() filters: GetUserPostsFiltersDto,
  ) {
    return this.postsService.getPostsByUser(token, filters);
  }

  /**
   * Create a repost for a specific post
   */
  @Post(':postId/repost')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a repost for a specific post' })
  @ApiBody({ type: RepostDto })
  async createRepost(
    @Headers('Authorization') token: string,
    @Body() repostDto: RepostDto,
  ) {
    return this.postsService.createRepost(
      token,
      repostDto.originalPostId,
      repostDto.postVisibility,
    );
  }

  /**
   * Get all attachments of a post as Base64-encoded JSON
   */
  @Get(':postId/attachments')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all attachments of a post as Base64-encoded JSON',
  })
  async getPostAttachments(
    @Headers('Authorization') token: string,
    @Param('postId') postId: string,
  ) {
    return this.postsService.getPostAttachments(token, postId);
  }

  /**
   * Delete a specific post
   */
  @Delete(':postId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a specific post' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  async deletePost(
    @Headers('Authorization') token: string,
    @Param('postId') postId: string,
  ) {
    try {
      return await this.postsService.deletePost(token, postId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

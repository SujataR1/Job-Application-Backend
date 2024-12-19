import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UploadedFiles,
  UseInterceptors,
  Headers,
  Patch,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { FilesInterceptor } from '@nestjs/platform-express';
import { PostsService } from './posts.service';
import * as multer from 'multer';
import { PostVisibilityEnum } from '@prisma/client';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Multer Configuration for File Uploads
  private readonly uploadMiddleware = multer.diskStorage({
    destination: 'uploads/posts', // Directory to store attachments
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });

  /**
   * Create a new post with optional file attachments
   */
  @Post('create')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a post with optional attachments' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'Title of the post',
          example: 'My First Post',
        },
        content: {
          type: 'string',
          description: 'Content of the post',
          example: 'This is a post with attachments.',
        },
        visibility: {
          type: 'string',
          description: 'Post visibility (Everyone, Connections, OnlyMe)',
          example: 'Everyone',
        },
        allowSharing: {
          type: 'boolean',
          description: 'Allow others to share the post',
          example: true,
        },
        allowReposts: {
          type: 'boolean',
          description: 'Allow others to repost',
          example: false,
        },
        attachments: {
          type: 'array',
          items: { type: 'string', format: 'binary' },
          description: 'Optional file attachments',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  @UseInterceptors(
    FilesInterceptor('attachments', 10, {
      storage: multer.diskStorage({
        destination: 'uploads/posts',
        filename: (req, file, cb) => {
          cb(null, `${Date.now()}-${file.originalname}`);
        },
      }),
    }),
  )
  async createPost(
    @Body() postData: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Headers('Authorization') token: string,
  ) {
    try {
      const filePaths = files.map((file) => file.path); // Extract paths of uploaded files
      return await this.postsService.createPost(token, postData, filePaths);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  @Patch(':postId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update specific details of a post' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'New title of the post',
          example: 'Updated Title',
        },
        content: {
          type: 'string',
          description: 'New content of the post',
          example: 'Updated content here.',
        },
        visibility: {
          type: 'string',
          description: 'New visibility for the post',
          example: 'Connections',
        },
        allowSharing: {
          type: 'boolean',
          description: 'Allow or disallow sharing',
          example: true,
        },
        allowReposts: {
          type: 'boolean',
          description: 'Allow or disallow reposting',
          example: false,
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  async updatePost(
    @Headers('Authorization') token: string,
    @Param('postId') postId: string,
    @Body()
    updateData: {
      title?: string;
      content?: string;
      visibility?: string;
      allowSharing?: boolean;
      allowReposts?: boolean;
    },
  ) {
    try {
      return await this.postsService.updatePost(token, postId, updateData);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get all posts by a user
   */
  @Get('user')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all posts by the authenticated user' })
  @ApiResponse({ status: 200, description: 'Posts fetched successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  async getPostsByUser(
    @Headers('Authorization') token: string,
    @Body()
    filters: {
      visibility?: string;
      allowReposts?: boolean;
      allowSharing?: boolean;
    },
  ) {
    try {
      // Narrow down the visibility type to match the expected enum
      const validatedFilters = {
        ...filters,
        visibility: filters.visibility as
          | 'Everyone'
          | 'Connections'
          | 'OnlyMe'
          | undefined,
      };

      return await this.postsService.getPostsByUser(token, validatedFilters);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Get all attachments of a post as Base64-encoded JSON
   */
  @Get(':postId/attachments')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get all attachments of a post as Base64-encoded JSON',
  })
  @ApiResponse({ status: 200, description: 'Attachments fetched successfully' })
  @ApiResponse({ status: 404, description: 'Post not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized access' })
  async getPostAttachments(
    @Headers('Authorization') token: string,
    @Param('postId') postId: string,
  ) {
    try {
      return await this.postsService.getPostAttachments(token, postId);
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * Delete a post
   */
  @Delete(':postId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post by ID' })
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

  /**
   * Create a repost
   */
  @Post(':originalPostId/repost')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a repost for a specific post' })
  @ApiResponse({ status: 201, description: 'Repost created successfully' })
  @ApiResponse({
    status: 404,
    description: 'Original post not found or reposting not allowed',
  })
  async createRepost(
    @Headers('Authorization') token: string,
    @Param('originalPostId') originalPostId: string,
    @Param('postVisibility') postVisibility: PostVisibilityEnum,
  ) {
    try {
      return await this.postsService.createRepost(
        token,
        originalPostId,
        postVisibility,
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}

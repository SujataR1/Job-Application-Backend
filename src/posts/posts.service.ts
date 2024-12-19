import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service'; // Assuming PrismaService is configured
import { Utilities } from '../utils/Utilities'; // Import await Utilities.VerifyJWT from Utilities
import { PostVisibilityEnum } from '@prisma/client'; // Import Prisma Enum for visibility

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  // Create a new post
  async createPost(token: string, postData: any, filePaths?: string[]) {
    const decoded = await Utilities.VerifyJWT(token);
    const { title, content, visibility, allowSharing, allowReposts } = postData;

    // Create the post
    const newPost = await this.prisma.posts.create({
      data: {
        userId: decoded.id,
        title,
        content,
        visibility: visibility
          ? PostVisibilityEnum[visibility]
          : PostVisibilityEnum.Everyone,
        allowSharing: allowSharing ?? true,
        allowReposts: allowReposts ?? false,
      },
    });

    // Handle optional attachments
    if (filePaths && filePaths.length > 0) {
      for (const filePath of filePaths) {
        await this.prisma.post_Attachments.create({
          data: {
            postId: newPost.id,
            attachmentPath: filePath,
          },
        });
      }
    }

    return { message: 'Post created successfully', post: newPost };
  }

  // Fetch a post by ID
  async getPostById(token: string, postId: string) {
    await Utilities.VerifyJWT(token);

    const post = await this.prisma.posts.findUnique({
      where: { id: postId },
      include: {
        attachments: true,
        Comments: { include: { user: true, attachments: true } },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    return post;
  }

  // Update a post
  async updatePost(token: string, postId: string, updateData: any) {
    const decoded = await Utilities.VerifyJWT(token);

    const post = await this.prisma.posts.findUnique({ where: { id: postId } });

    if (!post || post.userId !== decoded.id) {
      throw new UnauthorizedException('Unauthorized or Post not found');
    }

    if (updateData.visibility) {
      updateData.visibility = PostVisibilityEnum[updateData.visibility];
    }

    const updatedPost = await this.prisma.posts.update({
      where: { id: postId },
      data: updateData,
    });

    return { message: 'Post updated successfully', post: updatedPost };
  }

  // Delete a post
  async deletePost(token: string, postId: string) {
    const decoded = await Utilities.VerifyJWT(token);

    const post = await this.prisma.posts.findUnique({ where: { id: postId } });

    if (!post || post.userId !== decoded.id) {
      throw new UnauthorizedException('Unauthorized or Post not found');
    }

    await this.prisma.posts.delete({ where: { id: postId } });

    return { message: 'Post deleted successfully' };
  }

  // Create a repost
  async createRepost(
    token: string,
    originalPostId: string,
    postVisibility: PostVisibilityEnum,
  ) {
    try {
      const decoded = await Utilities.VerifyJWT(token);
      const originalPost = await this.prisma.posts.findUnique({
        where: { id: originalPostId },
      });

      if (!originalPost || !originalPost.allowReposts) {
        throw new NotFoundException(
          'Reposting not allowed or Original post not found',
        );
      }

      const repost = await this.prisma.posts.create({
        data: {
          user: {
            connect: { id: decoded.id }, // Use the `connect` clause for relations
          },
          originalPost: {
            connect: { id: originalPostId }, // Connect the original post relation
          },
          isRepost: true,
          visibility: postVisibility,
        },
      });

      return { message: 'Repost created successfully', post: repost };
    } catch (error) {
      console.error(error);
      throw new Error('Error creating repost');
    }
  }

  // Fetch posts by a user with optional filters
  async getPostsByUser(
    token: string,
    filters: {
      visibility?: keyof typeof PostVisibilityEnum;
      allowReposts?: boolean;
      allowSharing?: boolean;
    } = {},
  ) {
    const decoded = await Utilities.VerifyJWT(token);

    const { visibility, allowReposts, allowSharing } = filters;

    const posts = await this.prisma.posts.findMany({
      where: {
        userId: decoded.id,
        ...(visibility && { visibility: PostVisibilityEnum[visibility] }),
        ...(allowReposts !== undefined && { allowReposts }),
        ...(allowSharing !== undefined && { allowSharing }),
      },
      include: {
        attachments: true,
        Comments: true,
      },
    });

    return posts;
  }

  async getPostAttachments(token: string, postId: string) {
    const decoded = await Utilities.VerifyJWT(token);

    // Verify if the post exists and belongs to the user
    const post = await this.prisma.posts.findUnique({
      where: { id: postId },
      include: {
        user: true, // Include the user to validate ownership
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    // If the user querying is not the owner of the post, throw an exception
    if (post.userId !== decoded.id) {
      throw new UnauthorizedException(
        'You are not authorized to view the attachments of this post',
      );
    }

    // Fetch all attachments for the post
    const attachments = await this.prisma.post_Attachments.findMany({
      where: { postId },
      select: { attachmentPath: true }, // Retrieve only the paths
    });

    if (!attachments || attachments.length === 0) {
      return { message: 'No attachments found for this post', attachments: [] };
    }

    // Convert each file to Base64 using the Utility method
    const base64Attachments: Record<string, string> = {};

    for (const attachment of attachments) {
      const filePath = attachment.attachmentPath as string;
      base64Attachments[filePath] =
        await Utilities.encodeFileToBase64(filePath); // Utility method
    }

    return {
      message: 'Attachments fetched successfully',
      attachments: base64Attachments,
    };
  }
}

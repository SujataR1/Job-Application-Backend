import {
  Controller,
  Post,
  Patch,
  Delete,
  Get,
  Headers,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiParam } from '@nestjs/swagger';
import { JobPostsService } from './jobposts.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@ApiTags('JobPosts')
@Controller('jobposts')
export class JobPostsController {
  constructor(private readonly jobPostsService: JobPostsService) {}

  /**
   * Create a new job post.
   */
  @ApiOperation({
    summary: 'Create a new job post',
    description:
      'Allows an authorized user to create a job post for a company.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
  })
  @Post()
  async createJob(
    @Headers('Authorization') token: string,
    @Body() createJobDto: CreateJobDto,
  ) {
    return await this.jobPostsService.createJob(token, createJobDto);
  }

  /**
   * Update an existing job post.
   */
  @ApiOperation({
    summary: 'Update an existing job post',
    description:
      'Allows an authorized user to update a job post for a company.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
  })
  @Patch(':id')
  async updateJob(
    @Headers('Authorization') token: string,
    @Param('id') jobId: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    return await this.jobPostsService.updateJob(token, jobId, updateJobDto);
  }

  /**
   * Delete a job post.
   */
  @ApiOperation({
    summary: 'Delete a job post',
    description:
      'Allows an authorized user to delete a job post for a company.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
  })
  @Delete(':id')
  async deleteJob(
    @Headers('Authorization') token: string,
    @Param('id') jobId: string,
  ) {
    return await this.jobPostsService.deleteJob(token, jobId);
  }

  /**
   * List all companies a user can post jobs for.
   */
  @ApiOperation({
    summary: 'List all companies a user can post jobs for',
    description:
      'Fetches a list of companies where the user has admin or job posting permissions.',
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Bearer token for authentication',
  })
  @Get('companies-user-can-post-jobs-for')
  async getCompaniesUserCanPostJobsFor(
    @Headers('Authorization') token: string,
  ) {
    return await this.jobPostsService.getCompaniesUserCanPostJobsFor(token);
  }

  /**
   * Get a job by ID
   */
  @ApiOperation({
    summary: 'Get a job by ID',
    description: 'Fetches a specific job using its unique ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'The ID of the job',
    example: 'job-uuid-123',
  })
  @Get(':id')
  async getJobById(@Param('id') jobId: string) {
    return await this.jobPostsService.getJobById(jobId);
  }

  /**
   * Get jobs by company ID with pagination
   */
  @ApiOperation({
    summary: 'Get jobs by company ID',
    description:
      'Fetches jobs posted by a specific company with pagination support.',
  })
  @ApiParam({
    name: 'companyId',
    description: 'The ID of the company',
    example: 'company-uuid-123',
  })
  @Post('company/:companyId')
  async getJobsByCompanyId(
    @Param('companyId') companyId: string,
    @Body('limit') limit: string,
  ) {
    return await this.jobPostsService.getJobsByCompanyId(companyId, limit);
  }

  /**
   * Get jobs by poster ID with pagination
   */
  @ApiOperation({
    summary: 'Get jobs by poster ID',
    description:
      'Fetches jobs posted by a specific user with pagination support.',
  })
  @ApiParam({
    name: 'posterId',
    description: 'The ID of the poster (user)',
    example: 'user-uuid-123',
  })
  @Post('poster/:posterId')
  async getJobsByPosterId(
    @Param('posterId') posterId: string,
    @Body('limit') limit: string,
  ) {
    return await this.jobPostsService.getJobsByPosterId(posterId, limit);
  }
}

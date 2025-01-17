import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { Utilities } from '../utils/Utilities';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobPostsService {
  constructor(private prisma: PrismaService) {}

  // Method to post a job
  private async checkJobPermissions(
    userId: string,
    companyId: string,
  ): Promise<boolean> {
    const company = await this.prisma.companies.findUnique({
      where: { id: companyId },
      include: {
        pageAdmins: true, // Users who are admins of the company
        usersAllowedJobPosting: true, // Users allowed to post jobs
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with ID ${companyId} not found`);
    }

    // Check if the user is either an admin or has job posting permissions
    const isAdmin = company.pageAdmins.some((admin) => admin.id === userId);
    const hasJobPostingPermission = company.usersAllowedJobPosting.some(
      (user) => user.id === userId,
    );

    return isAdmin || hasJobPostingPermission;
  }

  /**
   * Create a new job post.
   */
  async createJob(token: string, createJobDto: CreateJobDto) {
    const decoded = await Utilities.VerifyJWT(token);
    const { companyId } = createJobDto;

    if (!companyId) {
      throw new UnauthorizedException('Company ID is required to create a job');
    }

    const hasPermission = await this.checkJobPermissions(decoded.id, companyId);

    if (!hasPermission) {
      throw new UnauthorizedException(
        'You do not have permission to create jobs for this company',
      );
    }

    // Create the job post
    const newJob = await this.prisma.jobPostings.create({
      data: {
        ...createJobDto,
        posterId: decoded.id, // The user creating the job
      },
    });

    return { message: 'Job created successfully', job: newJob };
  }

  /**
   * Update an existing job post.
   */
  async updateJob(token: string, jobId: string, updateJobDto: UpdateJobDto) {
    const decoded = await Utilities.VerifyJWT(token);

    const job = await this.prisma.jobPostings.findUnique({
      where: { id: jobId },
      include: { company: true }, // Include company relation for validation
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const hasPermission = await this.checkJobPermissions(
      decoded.id,
      job.companyId,
    );

    if (!hasPermission) {
      throw new UnauthorizedException(
        'You do not have permission to update this job',
      );
    }

    // Update the job post
    const updatedJob = await this.prisma.jobPostings.update({
      where: { id: jobId },
      data: updateJobDto,
    });

    return { message: 'Job updated successfully', job: updatedJob };
  }

  /**
   * Delete a job post.
   */
  async deleteJob(token: string, jobId: string) {
    const decoded = await Utilities.VerifyJWT(token);

    const job = await this.prisma.jobPostings.findUnique({
      where: { id: jobId },
      include: { company: true }, // Include company relation for validation
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${jobId} not found`);
    }

    const hasPermission = await this.checkJobPermissions(
      decoded.id,
      job.companyId,
    );

    if (!hasPermission) {
      throw new UnauthorizedException(
        'You do not have permission to delete this job',
      );
    }

    // Delete the job post
    await this.prisma.jobPostings.delete({ where: { id: jobId } });

    return { message: 'Job deleted successfully' };
  }

  // Method to get a job by job ID
  async getJobById(jobId: string) {
    const job = await this.prisma.jobPostings.findUnique({
      where: { id: jobId },
    });
    if (!job) throw new NotFoundException(`Job with ID ${jobId} not found`);
    return job;
  }

  // Method to get jobs by company ID with pagination
  async getJobsByCompanyId(companyId: string, limit: string) {
    const { skip, take } = this.parseLimit(limit);

    return await this.prisma.jobPostings.findMany({
      where: { companyId },
      skip,
      take,
    });
  }

  // Method to get jobs by poster ID with pagination
  async getJobsByPosterId(posterId: string, limit: string) {
    const { skip, take } = this.parseLimit(limit);

    return await this.prisma.jobPostings.findMany({
      where: { posterId },
      skip,
      take,
    });
  }

  async getCompaniesUserCanPostJobsFor(token: string) {
    const decoded = await Utilities.VerifyJWT(token);

    // Find all companies where the user is either an admin or has job posting permissions
    const companies = await this.prisma.companies.findMany({
      where: {
        OR: [
          {
            pageAdmins: {
              some: {
                id: decoded.id, // User is an admin
              },
            },
          },
          {
            usersAllowedJobPosting: {
              some: {
                id: decoded.id, // User has job posting permissions
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        websiteLink: true,
      },
    });

    return {
      message: 'Companies retrieved successfully',
      companies,
    };
  }

  // Helper method to parse the limit parameter
  private parseLimit(limit: string): { skip: number; take: number } {
    const [start, end] = limit.split('-').map((num) => parseInt(num, 10));

    if (isNaN(start) || isNaN(end) || start < 0 || end <= start) {
      throw new Error(
        'Invalid limit format. Use a format like "1-7" or "3-23"',
      );
    }

    return { skip: start - 1, take: end - start + 1 };
  }
}

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
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { CompanyService } from './company.service';
import { IndustryDto } from './dto/industry.dto';
import { CreateCompanyDto } from './dto/create-company.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompanyService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a company' })
  @ApiBearerAuth()
  @ApiBody({
    description: 'Details of the company',
    type: CreateCompanyDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Creates a company',
  })
  async create(
    @Headers('Authorization') authorizationHeader: string,
    @Body() createComapnyDto: CreateCompanyDto,
  ) {
    return this.companiesService.createCompany(
      createComapnyDto,
      authorizationHeader,
    );
  }

  @Patch('update')
  @ApiOperation({ summary: 'Update a company' })
  @ApiBearerAuth()
  @ApiBody({
    description: 'Updated company details along with companyId',
    schema: {
      type: 'object',
      properties: {
        companyId: {
          type: 'string',
          description: 'ID of the company to be updated',
        },
        updateData: {
          type: 'object',
          description: 'Fields to update',
          $ref: '#/components/schemas/CreateCompanyDto',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Updates a company',
  })
  async update(
    @Headers('Authorization') authorizationHeader: string,
    @Body() body: { companyId: string; updateData: Partial<CreateCompanyDto> },
  ) {
    const { companyId, updateData } = body;
    return this.companiesService.updateCompany(
      companyId,
      updateData,
      authorizationHeader,
    );
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete a company' })
  @ApiBearerAuth()
  @ApiBody({
    description: 'Company ID to delete',
    schema: {
      type: 'object',
      properties: {
        companyId: {
          type: 'string',
          description: 'ID of the company to be deleted',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Deletes a company',
  })
  async delete(
    @Headers('Authorization') authorizationHeader: string,
    @Body() body: { companyId: string },
  ) {
    const { companyId } = body;
    return this.companiesService.deleteCompany(companyId, authorizationHeader);
  }

  // 1. List companies the user is involved in
  @Get('involved')
  @ApiOperation({ summary: 'List companies the user is involved in' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns the list of companies the user is involved in.',
  })
  async listCompaniesInvolved(
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.companiesService.listCompaniesInvolved(authorizationHeader);
  }

  // 2. List companies the user is an admin of
  @Get('admin')
  @ApiOperation({ summary: 'List companies the user is an admin of' })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description: 'Returns the list of companies the user is an admin of.',
  })
  async listCompaniesAdminOf(
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.companiesService.listCompaniesAdminOf(authorizationHeader);
  }

  // 3. List companies where the user has job posting permissions
  @Get('job-permissions')
  @ApiOperation({
    summary: 'List companies where the user has job posting permissions',
  })
  @ApiBearerAuth()
  @ApiResponse({
    status: 200,
    description:
      'Returns the list of companies where the user has job posting permissions.',
  })
  async listCompaniesJobPostingPermissionIn(
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.companiesService.listCompaniesJobPostingPermissionIn(
      authorizationHeader,
    );
  }

  @Post('all')
  @ApiOperation({ summary: 'Get all companies with pagination' })
  @ApiBearerAuth()
  @ApiBody({
    description: 'Pagination range in the format "1-12", "13-27", etc.',
    schema: {
      type: 'object',
      properties: {
        limit: {
          type: 'string',
          description: 'Pagination range (e.g., "1-12")',
          example: '1-12',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of companies within the specified range',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request if the limit parameter is missing or invalid',
  })
  async getAllCompanies(@Body() body: { limit: string }) {
    return this.companiesService.getAllCompanies(body.limit);
  }

  // 4. Get company by ID
  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific company by ID' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the company' })
  @ApiResponse({
    status: 200,
    description: 'Returns the details of the specified company.',
  })
  async getCompanyById(@Param('id') companyId: string) {
    return this.companiesService.getCompanyById(companyId);
  }

  // 5. Send company invitation
  @Post(':id/invite')
  @ApiOperation({
    summary: 'Send an invitation to join a company (Admin only)',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Unique identifier of the company' })
  @ApiBody({
    description: 'Email of the user to invite',
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Invitation sent successfully.',
  })
  async sendCompanyInvitation(
    @Param('id') companyId: string,
    @Body('email') email: string,
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.companiesService.generateAndSendInvitation(
      companyId,
      email,
      authorizationHeader,
    );
  }

  // 6. Verify company invitation
  @Post('verify-invitation')
  @ApiOperation({ summary: 'Verify invitation to join a company' })
  @ApiBearerAuth()
  @ApiBody({
    description: 'The OTP for the invitation',
    schema: {
      type: 'object',
      properties: {
        otp: { type: 'string', example: 'ABC123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description:
      'Invitation verified successfully, and user is added to the company.',
  })
  async verifyCompanyInvitation(
    @Body('otp') otp: string,
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.companiesService.verifyInvitation(otp, authorizationHeader);
  }

  // 7. Add industry to a company (Admin only)
  @Post(':companyName/industries')
  @ApiOperation({ summary: 'Add an industry to a company (Admin only)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'companyName', description: 'The name of the company' })
  @ApiBody({
    description: 'Details of the industry to add',
    type: IndustryDto,
  })
  @ApiResponse({
    status: 201,
    description: 'Industry added to the company successfully.',
  })
  async addIndustryToCompany(
    @Param('companyName') companyName: string,
    @Body() industryDto: IndustryDto,
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.companiesService.addIndustryToCompany(
      industryDto.industryName,
      companyName,
      authorizationHeader,
    );
  }

  // 8. Remove industry from a company (Admin only)
  @Delete(':companyName/industries')
  @ApiOperation({ summary: 'Remove an industry from a company (Admin only)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'companyName', description: 'The name of the company' })
  @ApiBody({
    description: 'Details of the industry to remove',
    type: IndustryDto,
  })
  @ApiResponse({
    status: 200,
    description: 'Industry removed from the company successfully.',
  })
  async removeIndustryFromCompany(
    @Param('companyName') companyName: string,
    @Body() industryDto: IndustryDto,
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.companiesService.removeIndustryFromCompany(
      industryDto.industryName,
      companyName,
      authorizationHeader,
    );
  }

  @Post(':id/admins')
  @ApiOperation({ summary: 'Add an admin to a company (Admin only)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Unique identifier of the company' })
  @ApiBody({
    description: 'ID of the user to add as an admin',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '12345' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User added as an admin successfully.',
  })
  async addAdmin(
    @Param('id') companyId: string,
    @Body('userId') userId: string,
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.companiesService.addAdmin(
      companyId,
      userId,
      authorizationHeader,
    );
  }

  // 10. Remove an admin from the company
  @Delete(':id/admins')
  @ApiOperation({ summary: 'Remove an admin from a company (Admin only)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Unique identifier of the company' })
  @ApiBody({
    description: 'ID of the user to remove as an admin',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '12345' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User removed as an admin successfully.',
  })
  async removeAdmin(
    @Param('id') companyId: string,
    @Body('userId') userId: string,
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.companiesService.removeAdmin(
      companyId,
      userId,
      authorizationHeader,
    );
  }

  // 11. Add recruitment permissions to a user
  @Post(':id/recruitment-permissions')
  @ApiOperation({
    summary: 'Grant recruitment permissions to a user (Admin only)',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Unique identifier of the company' })
  @ApiBody({
    description: 'ID of the user to grant recruitment permissions',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '67890' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User granted recruitment permissions successfully.',
  })
  async addRecruitmentPermission(
    @Param('id') companyId: string,
    @Body('userId') userId: string,
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.companiesService.addRecruitmentPermission(
      companyId,
      userId,
      authorizationHeader,
    );
  }

  // 12. Remove recruitment permissions from a user
  @Delete(':id/recruitment-permissions')
  @ApiOperation({
    summary: 'Revoke recruitment permissions from a user (Admin only)',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Unique identifier of the company' })
  @ApiBody({
    description: 'ID of the user to revoke recruitment permissions',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '67890' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User recruitment permissions revoked successfully.',
  })
  async removeRecruitmentPermission(
    @Param('id') companyId: string,
    @Body('userId') userId: string,
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.companiesService.removeRecruitmentPermission(
      companyId,
      userId,
      authorizationHeader,
    );
  }

  // 14. Remove an involved user from a company
  @Delete(':id/involved-users')
  @ApiOperation({
    summary: 'Remove a user from a company as involved (Admin only)',
  })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Unique identifier of the company' })
  @ApiBody({
    description: 'ID of the user to remove as involved',
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: '34567' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User removed as involved successfully.',
  })
  async removeInvolvedUser(
    @Param('id') companyId: string,
    @Body('userId') userId: string,
    @Headers('Authorization') authorizationHeader: string,
  ) {
    return this.companiesService.removeInvolvedUser(
      companyId,
      userId,
      authorizationHeader,
    );
  }

  @Post(':id/logo')
  @ApiOperation({ summary: 'Upload a company logo (Admin only)' })
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Unique identifier of the company' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload company logo file (PNG, JPG, or JPEG only)',
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Company logo uploaded successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or other validation errors.',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadCompanyLogo(
    @Param('id') companyId: string,
    @UploadedFile() file: Express.Multer.File,
    @Headers('Authorization') authorizationHeader: string,
  ) {
    if (!file) {
      throw new BadRequestException(
        'Invalid file format. Only .png, .jpg, and .jpeg formats are allowed.',
      );
    }
    return this.companiesService.uploadCompanyLogo(
      companyId,
      file,
      authorizationHeader,
    );
  }

  // Get Company Logo
  @Get(':id/logo')
  @ApiOperation({ summary: 'Retrieve the company logo' })
  @ApiParam({ name: 'id', description: 'Unique identifier of the company' })
  @ApiResponse({
    status: 200,
    description: 'Company logo retrieved successfully.',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Company logo retrieved successfully.',
        },
        companyLogo: {
          type: 'string',
          example: '/uploads/logos/167648888-logo.png',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Company logo not found.',
  })
  async getCompanyLogo(@Param('id') companyId: string) {
    return this.companiesService.getCompanyLogo(companyId);
  }
}

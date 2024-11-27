import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiBody } from '@nestjs/swagger';

@ApiTags('Jobs')
@Controller('jobs')
export class JobsController {
  
  @Get()
  @ApiOperation({ summary: 'Get all job applications' })
  getAllJobs() {
    return 'List of all job applications';
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job application by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Job ID' })
  getJobById(@Param('id') id: string) {
    return `Job application with ID: ${id}`;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new job application' })
  @ApiBody({ description: 'Job Application data', type: Object })
  createJob(@Body() jobData) {
    return `Job application created: ${JSON.stringify(jobData)}`;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a job application by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Job ID' })
  updateJob(@Param('id') id: string, @Body() jobData) {
    return `Job application with ID: ${id} updated: ${JSON.stringify(jobData)}`;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a job application by ID' })
  @ApiParam({ name: 'id', required: true, description: 'Job ID' })
  deleteJob(@Param('id') id: string) {
    return `Job application with ID: ${id} deleted`;
  }
}

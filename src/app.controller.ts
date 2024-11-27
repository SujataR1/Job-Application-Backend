import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  createHello(@Body() createDto: any): string {
    return `Created Hello with data: ${JSON.stringify(createDto)}`;
  }

  @Delete(':id')
  deleteHello(@Param('id') id: string): string {
    return `Deleted Hello with ID: ${id}`;
  }
}

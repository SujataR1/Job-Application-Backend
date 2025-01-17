import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompaniesController } from './company.controller';
import { PrismaService } from '../prisma.service'; // Assuming PrismaService is in a shared directory

@Module({
  imports: [],
  controllers: [CompaniesController],
  providers: [CompanyService, PrismaService], // Registering the service and Prisma
  exports: [CompanyService], // Exporting CompaniesService if needed by other modules
})
export class CompaniesModule {}

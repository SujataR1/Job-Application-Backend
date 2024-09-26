import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { JobModule } from './job/job.module';
@Module({
  imports: [JobModule],  // Import your feature modules here
  controllers: [AppController],  // Add controllers if any
  providers: [AppService, PrismaService], // Add PrismaService and AppService to providers
})
export class AppModule {}

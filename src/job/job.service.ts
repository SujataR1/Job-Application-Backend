import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.JobCreateInput) {
    return this.prisma.job.create({
      data,
    });
  }

  findAll() {
    return this.prisma.job.findMany();
  }

  findOne(id: string) {
    return this.prisma.job.findUnique({
      where: { id },
    });
  }

  update(id: string, data: Prisma.JobUpdateInput) {
    return this.prisma.job.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.job.delete({
      where: { id },
    });
  }
}

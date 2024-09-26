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

  findOne(id: number) {
    return this.prisma.job.findUnique({
      where: { id },
    });
  }

  update(id: number, data: Prisma.JobUpdateInput) {
    return this.prisma.job.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.job.delete({
      where: { id },
    });
  }
}

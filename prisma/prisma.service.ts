// src/prisma/prisma.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();

    // Middleware to enforce the rule on lookingToApply and lookingToRecruit
    this.$use(async (params, next) => {
      // Apply middleware only for the User model
      if (
        params.model === 'User' &&
        (params.action === 'create' || params.action === 'update')
      ) {
        const data = params.args.data;

        // Check if both fields are being set to true
        if (data.lookingToApply && data.lookingToRecruit) {
          throw new Error(
            'Only one of lookingToApply or lookingToRecruit can be true.',
          );
        }

        // Automatically set the other field to false if one is true
        if (data.lookingToApply) {
          data.lookingToRecruit = false;
        } else if (data.lookingToRecruit) {
          data.lookingToApply = false;
        }
      }

      // Continue with the next middleware or Prisma operation
      return next(params);
    });
  }
}

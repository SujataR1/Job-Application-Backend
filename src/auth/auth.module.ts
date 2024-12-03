// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'prisma/prisma.service'; // or wherever your PrismaService is defined
import { JwtModule } from '@nestjs/jwt'; // Import JwtModule here

@Module({
  imports: [
    JwtModule.register({
      // Configure JwtModule (optional, but good for custom settings)
      secret:
        '8gpetQzbkhUJSmqs5X4YF4MfVr8dOaf-liq5aiSYfCk5TZFoQQJ5tzy-UIIFl9x47Fo1pEpReChmRj5hbidh_GRLW4bNd0o9OokN-JopyHAXnqCcRRo_xftX1wP0Bkj9oqbv_IYGNZM0umDOGS_YQNsm9Vxo5SVwsl9tgattpkFpHI1KeuEPePferuz9JGRxrEGrOJsJIiCk1v_5uw_NHEbUGV_Q0jnDeQ6m-h69RnKEPM02MMc8GG75_oJ_9uXdIwozq78b-lcqtua_08AyiZt4ND-lOjwitV8j4w0trJ36Axf-XWK0hVpmE1D8MLxW9DYqB1vkrcmfYXUuaKAr', // Replace with your own secret key
      signOptions: { expiresIn: '24h' }, // Example setting for token expiration
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService],
})
export class AuthModule {}

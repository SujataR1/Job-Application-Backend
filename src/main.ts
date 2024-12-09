import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable validation globally with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Enable transformation of input data
      whitelist: true, // Automatically remove properties not in DTO
      forbidNonWhitelisted: true, // Reject requests with extra properties
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Job Application Backend')
    .setDescription('Job Application API Description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // Enable CORS for the frontend
  app.enableCors({
    origin: '*', // Allow all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow all HTTP methods
    allowedHeaders: '*', // Allow all headers
    credentials: false, // Disable credentials
  });

  await app.listen(7000); // Start the NestJS app on port 7000
}

bootstrap();

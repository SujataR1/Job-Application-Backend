// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   // Swagger configuration
//   const config = new DocumentBuilder()
//     .setTitle('Job Application Backend')
//     .setDescription('OAS 3.0 API description')  // Custom subtitle
//     .setVersion('1.0')
//     .build();  // This was missing

//   const document = SwaggerModule.createDocument(app, config);
//   SwaggerModule.setup('swagger', app, document);

//   await app.listen(7000);
// }

// bootstrap();


import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';  // Import Swagger modules
import { ValidationPipe } from '@nestjs/common';



async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe());

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Job Application Backend')
    .setDescription('Job Application API Description')
    .setVersion('1.0')
    .build();  // Build the Swagger config

  const document = SwaggerModule.createDocument(app, config);  // Create Swagger document
  SwaggerModule.setup('swagger', app, document);  // Set up Swagger at /swagger route

  // Enable CORS for the frontend
  app.enableCors({
    origin: 'http://localhost:3000',  // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,  // Allow cookies to be sent across domains
  });

  await app.listen(7000);  // Start the NestJS app on port 7000
}

bootstrap();

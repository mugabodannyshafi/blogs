import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Set up global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Strips out any properties not defined in the DTO
    forbidNonWhitelisted: true,  // Throws an error if any non-DTO properties are present
    transform: true,  // Automatically transforms payloads to be objects typed according to their DTO classes
  }));

  const config = new DocumentBuilder()
    .setTitle('Blogs APIs')
    .setDescription('Blogs management APIs')
    .setVersion('1.0')
    .addTag('Blogs')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3002);
}

bootstrap();

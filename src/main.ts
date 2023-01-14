import { ValidationError } from '@nestjs/class-validator';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionHandler } from './utils/filters/http-exception.filter';
import { HttpResponseInterceptor } from './utils/interceptors/http-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix to /api, so all endpoint will be prefixed with /api
  app.setGlobalPrefix('api');

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('APP_NAME')
    .setDescription('APP_DESCRIPTION')
    .setVersion('APP_VERSION')
    .addTag('APP_TAG')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  // Set swagger location to /api
  SwaggerModule.setup('/api', app, document);

  // Api CORS configuration
  app.enableCors();

  // Using global pipe to validate request body, which retrun BadRequestException if validation failed
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException(validationErrors);
      },
      validationError: {
        target: false,
      },
      stopAtFirstError: true, // Stop validation if first error found
    }),
  );

  // Using http exception filter for filtering http exception
  app.useGlobalFilters(new HttpExceptionHandler());

  // using global interceptor for response
  app.useGlobalInterceptors(new HttpResponseInterceptor());

  // In case you want to use socket.io uncomment this line
  // app.useWebSocketAdapter(new IoAdapter(app));

  // Start server on port 3001
  await app.listen(3001);

  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

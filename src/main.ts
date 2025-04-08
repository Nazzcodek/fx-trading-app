import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      enableDebugMessages: true,
      disableErrorMessages: false,
      exceptionFactory: (validationErrors) => {
        const errors = validationErrors.map((error) => {
          const constraints = error.constraints
            ? Object.values(error.constraints)
            : ['Invalid value'];
          return {
            field: error.property,
            errors: constraints,
          };
        });

        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors,
        });
      },
    }),
  );

  // Enable CORS
  app.enableCors();

  // Swagger documentation setup
  const config = new DocumentBuilder()
    .setTitle('FX Trading API')
    .setDescription('API documentation for the FX Trading application')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Only redirect the ROOT path to Swagger
  app.getHttpAdapter().get('/', (req, res) => {
    res.redirect('/api');
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable cookie parsing for session management
  app.use(cookieParser());

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.APP_URL,
    credentials: true,
  });

  // Swagger/OpenAPI configuration
  const config = new DocumentBuilder()
    .setTitle('HumanLine HR API')
    .setDescription(
      'HumanLine HR/Employee Management SaaS platform API documentation',
    )
    .setVersion('1.0')
    .addCookieAuth('session_id', {
      type: 'apiKey',
      in: 'cookie',
      name: 'session_id',
    })
    .addTag('auth', 'Authentication endpoints')
    .addTag('organizations', 'Organization management endpoints')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  await app.listen(3001);
}
void bootstrap();

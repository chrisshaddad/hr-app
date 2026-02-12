import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('HumanLine HR API')
    .setDescription('Multi-tenant HR/Employee Management SaaS platform API')
    .setVersion('1.0')
    .addCookieAuth('session', {
      type: 'apiKey',
      name: 'session',
      in: 'cookie',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);
}
void bootstrap();

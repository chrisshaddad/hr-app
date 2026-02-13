import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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

  const config = new DocumentBuilder()
    .setTitle('HP-App API')
    .setDescription('API documentation for menu and modules')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(3001);
}
void bootstrap();

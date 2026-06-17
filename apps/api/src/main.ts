import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { SocketIoAdapter } from './chat/socket-io.adapter';
import morgan from 'morgan';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new SocketIoAdapter(app));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // middlewares
  app.enableCors({
    origin: [
      'http://localhost:5173', // Vite dev server (TundaAssist)
      'http://localhost:3000',
      'http://localhost:5174',
    ],
    credentials: true,
  });
  app.use(morgan('dev'));
  app.use(helmet());

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Tunda Assist Voice Agent API')
    .setDescription('REST API for the SunCulture Tunda Assist voice agent service')
    .setVersion('1.0')
    .addTag('call-reports', 'Call report management')
    .addTag('vapi', 'Vapi webhook handlers')
    .addTag('chat', 'Native OpenAI socket chat (REST for history)')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Server running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './shared/filters/all-exceptions.filter';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { WafCorporateInterceptor } from './shared/interceptors/waf-corporate.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log', 'debug'],
  });

  const config = app.get(ConfigService);
  const appDomain = config.get<string>('APP_DOMAIN', 'localhost');
  const port = config.get<number>('APP_PORT', 3000);

  // Security
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());

  // CORS — allow *.APP_DOMAIN + extra origins for local dev
  const extraOrigins = config.get<string>('CORS_EXTRA_ORIGINS', '').split(',').filter(Boolean);
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl / same-origin
      const isSubdomain = origin.endsWith(`.${appDomain}`) || origin === `https://${appDomain}`;
      const isExtra = extraOrigins.includes(origin);
      if (isSubdomain || isExtra) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Slug'],
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // Global filters & interceptors (WAF Layer 7 + Auditoria)
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new WafCorporateInterceptor(),
  );

  // API prefix
  app.setGlobalPrefix('api/v1');

  // Swagger (development only)
  if (config.get('NODE_ENV') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Portal ITSM API')
      .setDescription('Plataforma ITSM / Service Desk SaaS — API Reference')
      .setVersion('1.0')
      .addBearerAuth()
      .addCookieAuth('access_token')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port, '0.0.0.0');
  console.log(`[Portal API] running on port ${port} (${config.get('NODE_ENV')})`);
}

bootstrap();

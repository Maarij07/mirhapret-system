import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters';
import { ResponseInterceptor } from './common/interceptors';
import helmet from 'helmet';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const compression = require('compression');

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Suppress internal error stack traces from logs in production
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn']
      : ['log', 'debug', 'error', 'warn', 'verbose'],
  });

  const configService = app.get(ConfigService);
  const isProduction = configService.get('NODE_ENV') === 'production';

  // Security headers (X-Frame-Options, HSTS, CSP, XSS-Protection, no-sniff, etc.)
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow CDN images
    contentSecurityPolicy: isProduction ? undefined : false, // disable CSP in dev to allow Swagger
  }));

  // Gzip compression
  app.use(compression());

  // CORS — strict allowed origins from env
  const corsOriginsStr = configService.get<string>('CORS_ORIGINS') || 'http://localhost:3000,http://localhost:3001,http://localhost:3002';
  const corsOrigins = corsOriginsStr.split(',').map(o => o.trim());
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // API prefix
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // Validation pipe — whitelist strips unknown fields, transform auto-converts query params
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    stopAtFirstError: false,
  }));

  // Global exception filter — catches ALL unhandled exceptions
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());

  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`Application running on: http://localhost:${port}/${apiPrefix}`);
}
bootstrap();

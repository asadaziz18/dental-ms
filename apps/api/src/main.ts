import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { seedDevBranch } from './database/seed';
import { seedProcedures } from './database/seed-procedures';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { SocketIoAdapter } from './socket-io.adapter';

const corsOrigin = process.env.CORS_ORIGIN ?? 'http://localhost:5173';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useWebSocketAdapter(new SocketIoAdapter(app, corsOrigin));
  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  if (process.env.NODE_ENV !== 'production') {
    const dataSource = app.get(DataSource);
    await seedDevBranch(dataSource);
    await seedProcedures(dataSource);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`API listening on http://localhost:${port}`);
}
bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});

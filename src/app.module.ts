import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { PropostasModule } from './modules/propostas/propostas.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

@Module({
  imports: [PrismaModule, AuthModule, PropostasModule],
  providers: [
    { provide: APP_PIPE, useValue: new ValidationPipe({ whitelist: true, transform: true, errorHttpStatusCode: 400 }) },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
  ],
})
export class AppModule {}

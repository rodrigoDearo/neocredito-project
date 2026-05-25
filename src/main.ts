import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  if (process.env.NODE_ENV !== 'production') {
    const doc = SwaggerModule.createDocument(app,
      new DocumentBuilder().setTitle('Neo Crédito API').setVersion('1.0').addBearerAuth().build()
    );
    SwaggerModule.setup('docs', app, doc);
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 http://localhost:${port}  |  📖 http://localhost:${port}/docs`);
}
bootstrap();

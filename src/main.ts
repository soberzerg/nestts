import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { PaginatedResponseDto } from './general/paginated-response.dto';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('API docs')
    .setDescription('REST API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [PaginatedResponseDto],
  });
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();

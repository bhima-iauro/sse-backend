import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
// import { ValidationPipe } from '@nestjs/common';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //swagger config
  // console.log(process.env.PORT);
  // const swaggerConfig = new DocumentBuilder()
  //   .addServer(process.env.SWAGGER_BASEPATH)
  //   .setTitle(process.env.SWAGGER_TITLE)
  //   .setDescription(process.env.SWAGGER_DESC)
  //   .setVersion(process.env.SWAGGER_VERSION)
  //   .addTag(process.env.SWAGGER_TAG)
  //   .addBearerAuth()
  //   .build();
  // // enable validations
  // // app.useGlobalPipes(new ValidationPipe());
  // app.setGlobalPrefix(process.env.BASEPATH);

  // const document = SwaggerModule.createDocument(app, swaggerConfig);

  // SwaggerModule.setup(process.env.SWAGGER_DOC_PATH, app, document);
  const config = new DocumentBuilder()
    .setTitle(process.env.SWAGGER_TITLE)
    .setDescription(process.env.SWAGGER_DESC)
    .setVersion(process.env.SWAGGER_TAG)
    .addTag(process.env.SWAGGER_VERSION)
    .build();
  app.setGlobalPrefix(process.env.BASEPATH);
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/documetation', app, document);
  Logger.warn(process.env.PORT);
  await app.listen(process.env.PORT);
}
bootstrap();

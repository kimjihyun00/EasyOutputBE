import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as cookieParser from "cookie-parser";
import { ValidationPipe } from "@nestjs/common";
import { ValidationExceptionFactory } from "./common/filter/validation-exception.factory";
import { AllExceptionFilter } from "./common/filter/all-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    bufferLogs: true,
    logger: ["error", "warn", "log", "debug", "fatal", "verbose"],
  });
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // 정의한 값만 받기, 정의 안한 값이면 오류
      forbidNonWhitelisted: true,
      transform: true, // request 자동 형변환
      exceptionFactory: ValidationExceptionFactory,
    }),
  );

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT, () => {
    console.log(`Server running on ${PORT}`);
  });
}

bootstrap();

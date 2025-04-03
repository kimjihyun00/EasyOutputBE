import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from "@nestjs/common";
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from "./auth/auth.module";
import { APP_FILTER, APP_PIPE } from "@nestjs/core";
import { AllExceptionFilter } from "./common/filter/all-exception.filter";
import { ConfigModule } from "@nestjs/config";
import { RequestLoggerMiddleware } from "./common/middlewares/request-logger.middleware";
import { DiaryModule } from "./diary/diary.module";
import { ValidationExceptionFactory } from "./common/filter/validation-exception.factory";
import { OpenaiModule } from './utils/openai/openai.module';
import { DateModule } from './utils/date/date.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    DiaryModule,
    OpenaiModule,
    DateModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes("*");
    BigInt.prototype["toJSON"] = function () {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-call
      return this.toString();
    };
  }
}

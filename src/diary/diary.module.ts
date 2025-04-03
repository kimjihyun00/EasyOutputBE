import { Module } from "@nestjs/common";
import { DiaryController } from "./diary.controller";
import { DiaryService } from "./diary.service";
import { DatabaseModule } from "../database/database.module";
import { OpenaiModule } from "../utils/openai/openai.module";

@Module({
  imports: [DatabaseModule, OpenaiModule],
  controllers: [DiaryController],
  providers: [DiaryService],
})
export class DiaryModule {}

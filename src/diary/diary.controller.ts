import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { DiaryService } from "./diary.service";
import { Role } from "../common/decorators/role.decorator";
import { WriteDiaryDto } from "./dtos/write-diary.dto";
import { UserPayload } from "../auth/dtos/user-payload";
import { User } from "../common/decorators/user.decorator";
import { UpdateDiaryDto } from "./dtos/update-diary.dto";
import { CorrectionQuestionDto } from "./dtos/correction-queation.dto";
import { ListDiaryCalendarQueryDto } from "./dtos/list-diary-calendar-query.dto";
import { ListDiaryCursorQueryDto } from "./dtos/list-diary-cursor-query.dto";

@Controller("diary")
export class DiaryController {
  constructor(private diaryService: DiaryService) {}

  @HttpCode(200)
  @Role("USER")
  @Post("/write")
  writeNewDiary(@User() user: UserPayload, @Body() body: WriteDiaryDto) {
    return this.diaryService.createDiary(user.memberId, body);
  }

  @Role("USER")
  @Get("/list")
  getDiaryListOfUser(
    @User() user: UserPayload,
    @Query() query: ListDiaryCursorQueryDto,
  ) {
    return this.diaryService.getDiaryListOfUser(user.memberId, query);
  }

  @Role("USER")
  @Patch("/list/cal")
  getDiaryCalendarListOfUser(
    @User() user: UserPayload,
    @Query() query: ListDiaryCalendarQueryDto,
  ) {
    return this.diaryService.getDiaryCalendarListOfUser(user.memberId, query);
  }

  @Role("USER")
  @Get("/:diaryId")
  getDairy(@User() user: UserPayload, @Param("diaryId") diaryId: bigint) {
    return this.diaryService.getDiary(user, diaryId);
  }

  @HttpCode(200)
  @Patch("/:diaryId/edit")
  editDiary(
    @User() user: UserPayload,
    @Param("diaryId") diaryId: bigint,
    @Body() body: UpdateDiaryDto,
  ) {
    return this.diaryService.updateDiary(user, diaryId, body);
  }

  @HttpCode(200)
  @Post("/:diaryId/correction/ai")
  correctDiaryWithAi(
    @User() user: UserPayload,
    @Param("diaryId") diaryId: bigint,
  ) {
    return this.diaryService.correctDiaryWithAi(user, diaryId);
  }

  @HttpCode(200)
  @Post("/:diaryId/question")
  questionAboutDiaryCorrection(
    @User() user: UserPayload,
    @Param("diaryId") diaryId: bigint,
    @Body() body: CorrectionQuestionDto,
  ) {
    return this.diaryService.questionAboutDiaryCorrection(user, diaryId, body);
  }
}

import { Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";
import { WriteDiaryDto } from "./dtos/write-diary.dto";
import { DiaryLangCode, DiaryStatus } from "../common/enums/diary-code.enum";
import { ApiResponse } from "../common/response/api.response";
import { UserPayload } from "../auth/dtos/user-payload";
import { UpdateDiaryDto } from "./dtos/update-diary.dto";
import { OpenaiService } from "../utils/openai/openai.service";
import { Prisma, Correction } from "@prisma/client";
import { ParsedDiaryCorrectionResult } from "../utils/openai/types/diary-correction.type";
import { isEmpty } from "class-validator";
import { CorrectionQuestionDto } from "./dtos/correction-queation.dto";
import {
  DiaryRevisionStatus,
  DiaryRevisionType,
} from "../common/enums/diary-revision-code.enum";
import { CorrectionStatus } from "../common/enums/correction-code.enum";
import { CorrectionQuestionStatus } from "../common/enums/correction-question-code.enum";
import {
  CorrectionAnswerStatus,
  CorrectionAnswerType,
} from "../common/enums/correction-answer-code.enum";
import { ServiceException } from "../common/exceptions/service.execption";
import { CORRECTION_ANSWER } from "../common/constants";
import { DateUtil } from "../utils/date/date.util";
import { DiaryFilterQueryDto } from "./dtos/diary-filter-query.dto";

@Injectable()
export class DiaryService {
  constructor(
    private readonly database: DatabaseService,
    private readonly openaiService: OpenaiService,
    private readonly dateUtil: DateUtil,
  ) {}

  async createDiary(memberId: bigint, body: WriteDiaryDto) {
    const nowDate = this.dateUtil.getNowUTC();

    const diary = await this.database.diary.create({
      data: {
        memberId: memberId,
        lang: body.lang || DiaryLangCode.EN_US,
        status: DiaryStatus.Valid,
        title: body.title || "",
        content: body.content,
        diaryDate: body.diaryDate,
        createDate: nowDate,
        updateDate: nowDate,
      },
    });
    return new ApiResponse().setMessage("Diary created").setData(diary);
  }

  async getDiaryListOfUser(memberId: bigint, query: DiaryFilterQueryDto) {
    // 이번달의 시작과 끝.
    const { start, end } = this.dateUtil.getMonthStartAndEnd(
      query.year,
      query.month,
    );

    // gt, gte, lt, lte
    const diaries = await this.database.diary.findMany({
      relationLoadStrategy: "join",
      where: {
        memberId: memberId,
        status: DiaryStatus.Valid,
        diaryDate: {
          gte: start,
          lte: end,
        },
      },
      select: {
        diaryId: true,
        title: true,
        diaryDate: true,
        createDate: true,
        status: true,
        _count: {
          select: {
            revisions: { where: { status: DiaryRevisionStatus.Valid } },
          },
        },
      },
      orderBy: {
        // diaryDate: "desc",
        diaryDate: "asc",
      },
    });

    return new ApiResponse().setMessage("Diary list of users").setData(diaries);
  }

  async getDiary(user: UserPayload, diaryId: bigint) {
    const diary = await this.verifyDiaryOwner(user.memberId, diaryId);
    const revision = await this.database.diaryRevision.findFirst({
      relationLoadStrategy: "join",
      where: { diaryId: diaryId, status: DiaryRevisionStatus.Valid },
      include: {
        corrections: {
          where: { status: CorrectionStatus.Valid },
        },
      },
    });

    if (revision?.corrections) {
      revision.corrections = this.parseCorrections(revision.corrections);
    }

    return new ApiResponse().setMessage("Success to get diary.").setData({
      diary,
      revision,
    });
  }

  async updateDiary(user: UserPayload, diaryId: bigint, body: UpdateDiaryDto) {
    await this.verifyDiaryAlreadyCorrected(diaryId);
    const result = await this.database.diary.update({
      where: {
        diaryId: diaryId,
      },
      data: body,
    });

    return new ApiResponse()
      .setMessage("Success to update diary.")
      .setData(result);
  }

  async correctDiaryWithAi(user: UserPayload, diaryId: bigint) {
    const diary = await this.verifyDiaryOwner(user.memberId, diaryId);
    await this.verifyDiaryAlreadyCorrected(diaryId);

    const { result, model } = await this.openaiService.generateDiaryCorrection(
      diary.content,
    );

    const { revision } = await this.createDiaryCorrectionData(
      result,
      model,
      diaryId,
    );

    return new ApiResponse()
      .setStatusCode("success")
      .setMessage("Success to get diary revision from ai.")
      .setData(revision);
  }

  /**
   * AI 교정 결과를 기반으로 db에 데이터 저장
   * - revision db 저장
   * - correction records db 저장
   * @param aiResult
   * @param aiModel
   * @param diaryId
   */
  async createDiaryCorrectionData(
    aiResult: ParsedDiaryCorrectionResult,
    aiModel: string,
    diaryId: bigint,
  ) {
    return this.database.$transaction(async (tx) => {
      const nowDate = this.dateUtil.getNowUTC();
      const revision = await tx.diaryRevision.create({
        data: {
          diaryId: diaryId,
          status: DiaryRevisionStatus.Valid,
          type: `${DiaryRevisionType.Openai}/${aiModel}`,
          content: aiResult.corrected_diary,
          overallFeedback: aiResult.overall_feedback,
          createDate: nowDate,
          updateDate: nowDate,
        },
      });

      const correctionRecords: Prisma.CorrectionCreateManyInput[] =
        aiResult.corrections.map((correction) => ({
          revisionId: revision.revisionId,
          status: CorrectionStatus.Valid,
          original: correction.original,
          correction: correction.correction,
          explanation: correction.explanation,
          originalOffset: this.stringifyObject(correction.original_offset),
          correctionOffset: this.stringifyObject(correction.correction_offset),
          originalHighlights: this.stringifyObject(
            correction.original_highlights,
          ),
          correctionHighlights: this.stringifyObject(
            correction.correction_highlights,
          ),
          createDate: nowDate,
          updateDate: nowDate,
        }));

      const { count } = await tx.correction.createMany({
        data: correctionRecords,
      });

      console.log(`Created ${count} corrections.`);
      return {
        revision,
      };
    });
  }

  private parseCorrections(corrections: Correction[]) {
    console.log("Parsing corrections...");
    return corrections.map((correction) => this.parseCorrection(correction));
  }

  private parseCorrection(correction: Correction): Correction {
    return {
      ...correction,
      originalOffset: this.stringToJson(correction.originalOffset),
      originalHighlights: this.stringToJson(correction.originalHighlights),
      correctionOffset: this.stringToJson(correction.correctionOffset),
      correctionHighlights: this.stringToJson(correction.correctionHighlights),
    } as Correction;
  }

  /**
   *
   * @param user
   * @param diaryId
   * @param requestBody
   */
  async questionAboutDiaryCorrection(
    user: UserPayload,
    diaryId: bigint,
    requestBody: CorrectionQuestionDto,
  ) {
    const diary = await this.verifyDiaryOwner(user.memberId, diaryId);

    // 교정본이 있는지 확인
    const revision = await this.database.diaryRevision.findFirst({
      where: {
        diaryId,
        status: DiaryRevisionStatus.Valid,
      },
    });

    if (!revision) {
      // 교정한 후에 가능
      throw new ServiceException("CONFLICT", "DIARY_REVISION_NOT_FOUND");
    }

    const revisionId = revision.revisionId;

    // question 횟수 유효성 검증 (한 다이어리 당 3 질문까지만 가능)
    const questionCounts = await this.database.correctonQuestion.count({
      where: {
        revisionId,
        status: CorrectionQuestionStatus.Valid,
      },
    });

    if (questionCounts > CORRECTION_ANSWER.MAX_COUNT) {
      throw new ServiceException(
        "TOO_MANY_REQUESTS",
        "DIARY_QUESTION_INVALID_COUNT",
      );
    }

    const { result, model } = await this.openaiService.generateCorrectionAnswer(
      diary.content,
      revision.content,
      requestBody.question,
    );

    // transaction start
    return this.database.$transaction(async (tx) => {
      const nowDate = this.dateUtil.getNowUTC();
      // question db 저장
      const question = await tx.correctonQuestion.create({
        data: {
          revisionId,
          status: CorrectionQuestionStatus.Valid,
          question: requestBody.question,
          createDate: nowDate,
          updateDate: nowDate,
        },
      });

      // 답변 저장
      const answer = await tx.correctionAnswer.create({
        data: {
          questId: question.questionId,
          answer: result,
          type: `${CorrectionAnswerType.Openai}/${model}`,
          status: CorrectionAnswerStatus.Valid,
          createDate: nowDate,
          updateDate: nowDate,
        },
      });

      // 결과 리턴
      return new ApiResponse()
        .setMessage("Success to get answer of question.")
        .setData({
          answer,
        });
    });
  }

  /**
   * 다이어리 접근 권한 유효성 검사
   * - 다이어리 404 체크
   * - 다이어리 작성자 여부 확인
   * @param memberId
   * @param diaryId
   * @private
   */
  async verifyDiaryOwner(memberId: string | bigint, diaryId: bigint) {
    const diary = await this.database.diary.findFirst({
      where: {
        diaryId: diaryId,
        status: DiaryStatus.Valid,
      },
    });

    if (diary === null) {
      throw new ServiceException("NOT_FOUND", "DIARY_NOT_FOUND");
    }

    if (String(diary.memberId) !== String(memberId)) {
      throw new ServiceException("FORBIDDEN", "AUTHZ_NOT_DIARY_OWNER");
    }

    return diary;
  }

  /**
   * 이미 교정된 다이어리인지 검증
   * - 교정되었다면 Conflict 오류 리턴
   * @param diaryId
   * @private
   */
  async verifyDiaryAlreadyCorrected(diaryId: bigint) {
    const exRevision = await this.database.diaryRevision.findFirst({
      where: {
        diaryId: diaryId,
        status: DiaryStatus.Valid,
      },
    });

    if (exRevision !== null) {
      throw new ServiceException("CONFLICT", "DIARY_REVISION_EXIST");
    }

    return true;
  }

  /**
   * object 문자열로 변환
   * @param object
   * @private
   */
  private stringifyObject(object: any): string | null {
    try {
      return isEmpty(object) ? null : JSON.stringify(object);
    } catch (error) {
      console.error("Error stringifyObject: Could not serialize object", error);
      return null;
    }
  }

  /**
   * 문자열을 오브젝트로 변환
   * @param str
   * @private
   */
  private stringToJson(str: string | null | undefined): object | null {
    if (!str || str.trim().length === 0) {
      return null;
    }
    try {
      console.log(JSON.parse(str));
      return JSON.parse(str) as object;
    } catch (error) {
      console.error("Error stringToJson: Invalid JSON string", error);
      return null;
    }
  }
}

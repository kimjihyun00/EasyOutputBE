import { Injectable, Logger } from "@nestjs/common";
import OpenAI from "openai";
import { DIARY_CORRECTION_PROMPT } from "./prompts/diary-correction.prompt";
import {
  DiaryCorrectionResult,
  DiaryCorrectionUnit,
  ParsedDiaryCorrectionResult,
} from "./types/diary-correction.type";
import { ServiceException } from "../../common/exceptions/service.execption";

/**
 * @url https://platform.openai.com/docs/quickstart?api-mode=responses
 * @url https://www.npmjs.com/package/openai
 */
@Injectable()
export class OpenaiService {
  private readonly logger = new Logger(OpenaiService.name, { timestamp: true });

  private readonly client: OpenAI;
  private readonly DEFAULT_MODEL = "gpt-4o";

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * 유저가 작성한 일기 특정 언어에 대하여 첨삭 데이터
   * @param originalText {string} 유저가 작성했던 원문 전체
   */
  async generateDiaryCorrection(originalText: string) {
    try {
      const openaiResponse = await this.client.responses.create({
        model: this.DEFAULT_MODEL,
        instructions: DIARY_CORRECTION_PROMPT,
        input: originalText,
      });
      const rawOutputText =
        openaiResponse.output_text as unknown as DiaryCorrectionResult;
      this.logger.debug("Diary Correction Raw Output", rawOutputText);

      return {
        result: this.parseDiaryCorrectionResponse(originalText, rawOutputText),
        model: openaiResponse.model,
      };
    } catch (e) {
      if (e instanceof ServiceException) {
        throw e;
      } else {
        throw new ServiceException(
          "INTERNAL_SERVER_ERROR",
          "OPENAI_UNKNOWN_ERROR",
          e,
        );
      }
    }
  }

  /**
   * 유저가 교정한 일기에 대한 질문 답변하기
   * @param originalText {string} 교정 전 유저가 작성한 원문
   * @param correctedText {string} 교정된 전문
   * @param question {string} 유저 질문
   */
  async generateCorrectionAnswer(
    originalText: string,
    correctedText: string,
    question: string,
  ) {
    const openaiResponse = await this.client.responses.create({
      model: this.DEFAULT_MODEL,
      instructions:
        "You are an expert English writing correction assistant specialized in personal diary entries. Please answer in Korean.",
      input: [
        { role: "user", content: `original: ${originalText}` },
        { role: "assistant", content: `correct:${correctedText}` },
        {
          role: "user",
          content: question,
        },
      ],
    });
    const rawOutputText = openaiResponse.output_text as unknown as string;
    this.logger.debug("Diary Correction Raw Output", rawOutputText);
    return {
      result: rawOutputText,
      model: openaiResponse.model,
    };
  }

  parseDiaryCorrectionResponse(
    originalText: string,
    response: DiaryCorrectionResult,
  ): ParsedDiaryCorrectionResult {
    try {
      return {
        corrected_diary: response.corrected_diary,
        overall_feedback: response.overall_feedback,
        corrections: response.corrections.map((correction) =>
          this.parseSingleCorrectionUnit(
            originalText,
            response.corrected_diary,
            correction,
          ),
        ),
      };
    } catch (e) {
      throw new ServiceException(
        "INTERNAL_SERVER_ERROR",
        "OPENAI_RESPONSE_PARSING_ERROR",
        e,
      );
    }
  }

  private parseSingleCorrectionUnit(
    originalDiary: string,
    correctedDiary: string,
    correction: DiaryCorrectionUnit,
  ) {
    return {
      original: correction.original,
      original_offset: this.findTextOffset(originalDiary, correction.original),
      original_highlights: this.extractHighlightOffsets(
        originalDiary,
        correction.original_highlights,
      ),
      correction: correction.correction,
      correction_offset: this.findTextOffset(
        correctedDiary,
        correction.correction,
      ),
      correction_highlights: this.extractHighlightOffsets(
        correctedDiary,
        correction.correction_highlights,
      ),
      explanation: correction.explanation,
    };
  }

  private extractHighlightOffsets(parent: string, highlights: string[]) {
    return highlights
      .map((text) => this.parseHighlight(parent, text))
      .filter(({ start }) => start !== -1);
  }

  private findTextOffset(
    sourceText: string,
    searchText: string,
  ): null | [start: number, end: number] {
    const start = sourceText.indexOf(searchText);
    return start === -1 ? null : [start, start + searchText.length];
  }

  private parseHighlight(sourceText: string, searchText: string) {
    const start = sourceText.indexOf(searchText);
    // 문자열이 없을 경우 안전 처리
    if (start === -1) {
      return {
        start: -1,
        end: -1,
        text: searchText,
      };
    }
    const end = start + searchText.length;
    return { start, end, text: searchText };
  }
}

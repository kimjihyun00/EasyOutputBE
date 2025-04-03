import { IsString, MaxLength, MinLength } from "class-validator";
import { CONNECTION_QUESTION } from "../../common/constants";

export class CorrectionQuestionDto {
  @IsString()
  @MinLength(CONNECTION_QUESTION.MIN_LENGTH)
  @MaxLength(CONNECTION_QUESTION.MAX_LENGTH)
  readonly question: string;
}

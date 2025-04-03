import { IsString, MaxLength, MinLength } from "class-validator";

export class CorrectionQuestionDto {
  @IsString()
  @MinLength(20)
  @MaxLength(100)
  readonly question: string;
}

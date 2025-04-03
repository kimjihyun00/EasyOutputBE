import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MIN_LENGTH,
  MinLength,
} from "class-validator";
import { DIARY } from "../../common/constants";

export class WriteDiaryDto {
  @IsString()
  @IsOptional()
  readonly lang?: string;

  @IsString()
  @IsOptional()
  @MaxLength(DIARY.TITLE.MAX_LENGTH)
  readonly title?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(DIARY.CONTENT.MIN_LENGTH)
  @MaxLength(DIARY.CONTENT.MAX_LENGTH)
  readonly content: string;

  @IsNotEmpty()
  @IsDate()
  readonly diaryDate: Date;
}

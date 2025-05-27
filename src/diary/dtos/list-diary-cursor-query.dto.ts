import { IsDateString, IsOptional, IsString } from "class-validator";

export class ListDiaryCursorQueryDto {
  @IsOptional()
  @IsDateString()
  readonly cursor?: string; // diaryDate 기준
}

import { IsNumber, IsOptional, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class ListDiaryCalendarQueryDto {
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  readonly year?: number;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  readonly month?: number;
}

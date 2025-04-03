import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class WriteDiaryDto {
  @IsString()
  @IsOptional()
  readonly lang?: string;

  @IsString()
  @IsOptional()
  readonly title?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  readonly content: string;

  @IsNotEmpty()
  readonly diaryDate: Date;
}

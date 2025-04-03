import { PartialType } from "@nestjs/mapped-types";
import { WriteDiaryDto } from "./write-diary.dto";

export class UpdateDiaryDto extends PartialType(WriteDiaryDto) {}

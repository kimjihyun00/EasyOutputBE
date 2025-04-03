import { applyDecorators, SetMetadata, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { MemberRoleType } from "../enums/member-code.enum";
import { RoleGuard } from "../../auth/guards/role.guard";

export function Role(...roles: MemberRoleType[]) {
  return applyDecorators(
    SetMetadata("roles", roles),
    UseGuards(JwtAuthGuard),
    UseGuards(RoleGuard),
  );
}

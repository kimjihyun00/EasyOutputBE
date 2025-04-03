import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserPayload } from "../../auth/dtos/user-payload";
import { AuthenticatedRequest } from "../types/authenticated.request";

export const User = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request: AuthenticatedRequest = ctx.switchToHttp().getRequest();
    const user = request.user;
    console.log("@User(): ", data, user);
    return user || null;
  },
);

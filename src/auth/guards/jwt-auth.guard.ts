import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import * as process from "node:process";
import { AuthenticatedRequest } from "../../common/types/authenticated.request";
import { UserPayload } from "../dtos/user-payload";
import { MemberRole } from "../../common/enums/member-code.enum";
import { ServiceException } from "../../common/exceptions/service.execption";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new ServiceException("UNAUTHORIZED", "AUTH_INVALID_TOKEN");
    }

    try {
      const payload: UserPayload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET_KEY,
      });

      request.user = new UserPayload(
        payload.memberId,
        payload.email,
        <MemberRole>payload.role,
      );
    } catch {
      throw new ServiceException("UNAUTHORIZED", "AUTH_INVALID_TOKEN");
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | null {
    const [type, token] = request.headers.authorization?.split(" ") ?? [];
    return type === "Bearer" ? token : null;
  }
}

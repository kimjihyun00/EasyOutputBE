import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Reflector } from "@nestjs/core";
import { AuthenticatedRequest } from "../../common/types/authenticated.request";
import {
  MemberRole,
  MemberRoleType,
} from "../../common/enums/member-code.enum";
import { ServiceException } from "../../common/exceptions/service.execption";

@Injectable()
export class RoleGuard extends AuthGuard("jwt") {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest(err, user, info) {
    if (err) {
      throw err;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user || null;
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<MemberRoleType[]>(
      "roles",
      [context.getHandler(), context.getClass()],
    );

    const request: AuthenticatedRequest = context.switchToHttp().getRequest();
    const userPayload = request.user;

    console.log("requiredRoles", requiredRoles);
    if (!userPayload) {
      throw new ServiceException("UNAUTHORIZED", "AUTH_UNAUTHORIZED");
    }

    if (requiredRoles.includes(<MemberRoleType>userPayload.role)) {
      return true;
    }

    return true;
  }
}

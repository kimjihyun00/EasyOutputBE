import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { UserPayload } from "../dtos/user-payload";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: "email" });
  }

  async validate(username: string, password: string): Promise<UserPayload> {
    const member = await this.authService.validateEmailLogin({
      email: username,
      password: password,
    });
    return new UserPayload(member.memberId, member.email, member.role);
  }
}

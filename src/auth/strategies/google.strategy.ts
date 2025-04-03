import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth20";
import {} from "passport-oauth2";
import { Injectable, Logger } from "@nestjs/common";
import * as process from "node:process";
import { GoogleProfile } from "../dtos/google-profile";
import { AuthService } from "../auth.service";
import { UserPayload } from "../dtos/user-payload";

/**
 * 참고 공식 문서
 * @url https://developers.google.com/identity/protocols/oauth2/javascript-implicit-flow?hl=ko
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  private readonly logger = new Logger(GoogleStrategy.name);
  constructor(private readonly authService: AuthService) {
    super({
      clientID: process.env.OAUTH_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.OAUTH_GOOGLE_CLIENT_SECRET || "",
      callbackURL: "http://localhost:3000/auth/oauth2/google/cb",
      scope: ["email", "profile"],
    });
  }

  // refreshToken을 얻고 싶다면 해당 메서드 설정 필수
  authorizationParams(): { [key: string]: string } {
    this.logger.log(`AuthorizationParams`);
    return {
      access_type: "offline",
      prompt: "select_account",
    };
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ) {
    this.logger.log("GoogleStrategy - validate");
    try {
      const googleProfile = new GoogleProfile({
        displayName: profile.displayName as string,
        email: profile.emails[0].value as string,
        externalId: profile.id as string,
        provider: profile.provider as string,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });

      const member =
        await this.authService.signupOrLoginWithGoogle(googleProfile);
      const userPayload = new UserPayload(
        member.memberId,
        member.email,
        member.role,
      );
      done(null, userPayload);
    } catch (e) {
      this.logger.error(e);
      done(e);
    }
  }
}

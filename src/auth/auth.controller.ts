import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  Res,
  Query,
  Req,
  Logger,
  Session,
  BadRequestException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { EmailSignupDto } from "./dtos/email-signup.dto";
import { AuthGuard } from "@nestjs/passport";
import { UserPayload } from "./dtos/user-payload";
import { User } from "../common/decorators/user.decorator";
import { Request, Response } from "express";
import { Role } from "../common/decorators/role.decorator";
import { GoogleOAuthGuard } from "./guards/google-oauth.guard";

@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(private authService: AuthService) {}

  @Role("USER")
  @Get("profile")
  async getProfile(@User() userPayload: UserPayload) {
    return this.authService.getProfile(userPayload);
  }

  @HttpCode(200)
  @Post("signup/email")
  async signupWithEmail(@Body() emailSignupDto: EmailSignupDto) {
    return await this.authService.signupWithEmail(emailSignupDto);
  }

  @HttpCode(200)
  @Post("login/email")
  @UseGuards(AuthGuard("local"))
  loginWithEmail(
    @User() userPayload: UserPayload,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(response, userPayload);
  }

  @Get("oauth2/google")
  @UseGuards(GoogleOAuthGuard)
  loginWithGoogle() {
    return "login with google";
  }

  @Get("oauth2/google/cb")
  @UseGuards(GoogleOAuthGuard)
  callbackLoginWithGoogle(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
    @User() userPayload: UserPayload,
  ) {
    return this.authService.login(response, userPayload);
  }
}

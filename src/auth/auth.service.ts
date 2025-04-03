import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
  UnauthorizedException,
} from "@nestjs/common";
import { EmailLoginDto } from "./dtos/email-login.dto";
import { DatabaseService } from "../database/database.service";
import { ApiResponse } from "../common/response/api.response";
import * as bcrypt from "bcrypt";
import { EmailSignupDto } from "./dtos/email-signup.dto";
import { JwtService } from "@nestjs/jwt";
import { UserPayload } from "./dtos/user-payload";
import { Response } from "express";
import { GoogleProfile } from "./dtos/google-profile";
import { MemberRole, MemberStatus } from "../common/enums/member-code.enum";
import { ServiceException } from "../common/exceptions/service.execption";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name, { timestamp: true });
  constructor(
    private database: DatabaseService,
    private jwtService: JwtService,
  ) {}

  async getProfile(userPayload: UserPayload) {
    const member = await this.database.member.findFirst({
      where: {
        memberId: userPayload.memberId,
        status: MemberStatus.Valid,
      },
    });
    this.logger.log("db member: ", member);

    if (member === null) {
      throw new ServiceException("NOT_FOUND", "USER_NOT_FOUND");
    }

    return new ApiResponse().setMessage("회원가입 성공").setData({
      memberId: member.memberId,
      email: member.email,
      username: member.username,
      role: member.role,
      signupDate: member.signupDate,
    });
  }

  login(response: Response, userPayload: UserPayload) {
    this.logger.log("login userPayload: ", userPayload);
    const access_token = this.jwtService.sign(userPayload.toJSON(), {
      expiresIn: "1d",
    });
    this.logger.log("Access-Token:" + access_token);
    response.setHeader("Access-Token", access_token);
    return new ApiResponse().setMessage("로그인 성공");
  }

  async signupOrLoginWithGoogle(googleProfile: GoogleProfile) {
    this.logger.log("loginWithGoogle: ", googleProfile);
    // 회원 정보가 있다면 로그인
    let member = await this.database.member.findFirst({
      where: {
        oauthProvider: googleProfile.provider,
        oauthId: googleProfile.externalId,
        status: MemberStatus.Valid,
      },
    });

    if (member === null) {
      // 만약 회원 정보가 없다면 회원가입시키기
      member = await this.database.member.create({
        data: {
          email: googleProfile.email,
          password: "",
          username: googleProfile.displayName,
          status: MemberStatus.Valid,
          role: MemberRole.User,
          oauthProvider: googleProfile.provider,
          oauthId: googleProfile.externalId,
          signupDate: new Date(),
          updateDate: new Date(),
        },
      });
    }

    return member;
  }

  async signupWithEmail(emailSignupDto: EmailSignupDto) {
    const member = await this.database.member.findFirst({
      where: {
        email: emailSignupDto.email,
        status: MemberStatus.Valid,
      },
    });

    if (member) {
      throw new ServiceException("CONFLICT", "USER_DUPLICATE");
    }

    const newMember = await this.database.member.create({
      data: {
        email: emailSignupDto.email,
        password: await bcrypt.hash(emailSignupDto.password, 10),
        username: emailSignupDto.username,
        status: MemberStatus.Valid,
        role: MemberRole.User,
        signupDate: new Date(),
        updateDate: new Date(),
      },
    });

    const userPayload = new UserPayload(
      newMember.memberId,
      newMember.email,
      newMember.username,
    );

    return new ApiResponse().setMessage("회원가입 성공").setData(userPayload);
  }

  async validateEmailLogin(emailLoginDto: EmailLoginDto) {
    const member = await this.database.member.findFirst({
      where: {
        email: emailLoginDto.email,
        status: MemberStatus.Valid,
      },
    });

    if (member === null) {
      throw new ServiceException("NOT_FOUND", "USER_NOT_FOUND");
    }

    const isMatch = await bcrypt.compare(
      emailLoginDto.password,
      member.password,
    );

    if (!isMatch) {
      throw new ServiceException("BAD_REQUEST", "AUTH_WRONG_PASSWORD");
    }

    return member;
  }
}

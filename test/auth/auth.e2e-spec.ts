import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../../src/app.module";
import * as cookieParser from "cookie-parser";

describe("Auth e2e Test", () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use(cookieParser());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("이메일_회원가입", () => {
    return request(app.getHttpServer(), {})
      .post("/auth/signup/email")
      .send({
        email: "test@test.com",
        password: "qwer1234",
        username: "test1",
      })
      .expect(200)
      .expect("Hello World!");
  });

  it("이메일 로그인 토큰 정보 확인", async () => {
    const res1 = await request(app.getHttpServer(), {})
      .post("/auth/login/email")
      .send({
        email: "test@test.com",
        password: "qwer1234",
      });
    const accessToken = res1.headers["access-token"];
    expect(res1.status).toBe(200);
    expect(accessToken).toBeDefined();

    const res2 = await request(app.getHttpServer(), {})
      .get("/auth/profile")
      .set("Authorization", `Bearer ${accessToken}`);

    const profile = res2.body.data;
    expect(res2.status).toBe(200);
    expect(profile.memberId).toBe("1");
    expect(profile.email).toBe("test@test.com");
  });

  it("이메일_로그인_비밀번호_오류", () => {
    return request(app.getHttpServer(), {})
      .post("/auth/login/email")
      .send({
        email: "test@test.com",
        password: "qwer1234!",
      })
      .expect(400)
      .expect({
        statusCode: "error",
        message: "비밀번호 오류",
        data: {},
        error: "Bad Request",
      });
  });
});

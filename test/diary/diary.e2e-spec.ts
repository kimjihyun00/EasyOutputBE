import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { App } from "supertest/types";
import { AppModule } from "../../src/app.module";
import * as cookieParser from "cookie-parser";
import * as request from "supertest";
import { ValidationExceptionFactory } from "../../src/common/filter/validation-exception.factory";
import { AllExceptionFilter } from "../../src/common/filter/all-exception.filter";

describe("Diary e2e Test", () => {
  let app: INestApplication<App>;
  let accessToken: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication({});
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // 정의한 값만 받기, 정의 안한 값이면 오류
        forbidNonWhitelisted: true,
        transform: true, // request 자동 형변환
        exceptionFactory: ValidationExceptionFactory,
      }),
    );
    await app.init();
  });

  beforeEach(async () => {
    const res = await request(app.getHttpServer(), {})
      .post("/auth/login/email")
      .send({
        email: "test@test.com",
        password: "qwer1234",
      });

    accessToken = res.headers["access-token"];
    expect(accessToken).toBeDefined();
  });

  it("다이어리_작성", async () => {
    const res = await request(app.getHttpServer(), {})
      .post("/diary/write")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "test diary",
        content:
          "this is a test diary content. I should write anything even though i'm not good at English. omg... I want to be the greatest programmer in Nest.js. How can i be that? I want to be really rich, cute and pretty savage. Like Jennie.",
        diaryDate: new Date(),
      });

    console.log("----response-----\n", res.body);
    console.log(res.body.data);

    expect(res.status).toBe(200);
    expect(res.statusCode).toBe("success");
    expect(res.body).toHaveProperty("message");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toBe({});
  });

  it("다이어리_글자수_에러", async () => {
    const res = await request(app.getHttpServer(), {})
      .post("/diary/write")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "",
        content: "A".repeat(1004),
        diaryDate: new Date(),
      });

    console.log("----response-----\n", res.body, "\n", res.body.data);

    expect(res.status).toBe(400);
    expect(res.body.statusCode).toBe("error");
    expect(res.body).toHaveProperty("data");
    expect(res.body.data.content.errors).toEqual([
      "content must be shorter than or equal to 1000 characters",
    ]);
  });

  it("다이어리_수정하기", async () => {
    const res = await request(app.getHttpServer(), {})
      .patch("/diary/1/edit")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "edit diary",
      });
    console.log("----response-----\n", res.body, "\n", res.body.data);
    expect(res.status).toBe(200);
  });

  it("다이어리_수정_에러", async () => {
    const res = await request(app.getHttpServer(), {})
      .patch("/diary/1/edit")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        title: "edit diary",
        unregistered: true,
      });
    console.log("----response-----\n", res.body, "\n", res.body.data);
    expect(res.status).toBe(400);
  });
});

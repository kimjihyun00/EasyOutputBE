import { Test, TestingModule } from "@nestjs/testing";
import { DateUtil } from "../../../src/utils/date/date.util";
import * as process from "node:process";

describe("DateService", () => {
  let dateUtil: DateUtil;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateUtil],
    }).compile();

    dateUtil = module.get<DateUtil>(DateUtil);
  });

  it("should be defined", () => {
    expect(dateUtil).toBeDefined();
  });

  describe("formatDate", () => {
    it("should format a date with the default format", () => {
      const date = new Date("2023-10-27T10:30:00Z");
      const formattedDate = dateUtil.formatDate(date);
      expect(formattedDate).toBe("2023-10-27 10:30:00");
    });

    it("should format a date with a custom format", () => {
      const date = new Date("2023-10-27T10:30:00Z");
      const formattedDate = dateUtil.formatDate(
        date,
        "yyyy년 MM월 dd일 HH시 mm분 ss초",
      );
      expect(formattedDate).toBe("2023년 10월 27일 10시 30분 00초");
    });
  });

  describe("toUTC", () => {
    it("should convert a Date object to UTC", () => {
      const date = new Date("2023-10-27T10:30:00+09:00"); // KST
      const utcDate = dateUtil.toUTC(date);
      expect(utcDate.toISOString()).toBe("2023-10-27T01:30:00.000Z");
    });

    it("should convert a date string to UTC", () => {
      const dateString = "2023-10-27T10:30:00+09:00";
      const utcDate = dateUtil.toUTC(dateString);
      expect(utcDate.toISOString()).toBe("2023-10-27T01:30:00.000Z");
    });

    it("should convert a Date object to UTC with a custom time zone", () => {
      const date = new Date("2023-10-27T10:30:00+02:00"); // CEST
      const utcDate = dateUtil.toUTC(date);
      expect(utcDate.toISOString()).toBe("2023-10-27T08:30:00.000Z");
    });
  });

  describe("getNowUTC", () => {
    it("should return the current UTC time", () => {
      const now = new Date();
      const utcNow = dateUtil.getNowUTC();

      // 시간의 차이가 1초 이내인지 확인 (테스트 실행 환경에 따라 오차가 발생할 수 있음)
      const diff = Math.abs(now.getTime() - utcNow.getTime());
      expect(diff).toBeLessThan(1000); // 1초(1000ms) 이내
      expect(utcNow.toISOString().endsWith("Z")).toBe(true); // UTC 시간인지 확인
    });
  });
});

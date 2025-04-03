import { Injectable } from "@nestjs/common";
import { DateUtilInterface } from "./date.util.interface";
import { toDate, formatInTimeZone } from "date-fns-tz";
import { startOfMonth, endOfMonth } from "date-fns";
import { UTCDate } from "@date-fns/utc";

/**
 * @link https://date-fns.org/docs/Getting-Started#npm
 */
@Injectable()
export class DateUtil implements DateUtilInterface {
  readonly DEFAULT_TIME_ZONE: string = "UTC";
  readonly DEFAULT_DATE_FORMAT: string = "yyyy-MM-dd HH:mm:ss";

  formatDate(date: Date, formatStr: string = this.DEFAULT_DATE_FORMAT): string {
    return formatInTimeZone(date, this.DEFAULT_TIME_ZONE, formatStr);
  }

  toUTC(date: Date | string): Date {
    return new UTCDate(toDate(date));
  }

  getNowUTC(): Date {
    return new UTCDate();
  }

  getMonthStartAndEnd(
    year?: number,
    month?: number,
  ): { start: Date; end: Date } {
    const now = new UTCDate();
    const standardDate = new UTCDate(
      year || now.getUTCFullYear(),
      month || now.getUTCMonth(),
      1,
    );

    const startDate = new UTCDate(startOfMonth(standardDate));
    const endDate = new UTCDate(endOfMonth(standardDate));

    return {
      start: startDate,
      end: endDate,
    };
  }
}

import { Injectable } from "@nestjs/common";
import { DateUtilInterface } from "./date.util.interface";
import { format, toDate, formatInTimeZone } from "date-fns-tz";
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
    return new UTCDate(toDate(date, { timeZone: this.DEFAULT_TIME_ZONE }));
  }

  getNowUTC(): Date {
    return new UTCDate();
  }
}

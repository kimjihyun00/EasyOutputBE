export interface DateUtilInterface {
  readonly DEFAULT_TIME_ZONE: string;
  readonly DEFAULT_DATE_FORMAT: string;

  formatDate(date: Date, formatStr: string): string;
  toUTC(date: Date | string): Date;
  getNowUTC(): Date;
}

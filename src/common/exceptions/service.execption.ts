import { HttpException, HttpStatus } from "@nestjs/common";
import { ERROR_CODES } from "../constants/error-codes";

export class ServiceException extends HttpException {
  private readonly _errorCode: string | number;
  private readonly _error = {};

  constructor(
    status: keyof typeof HttpStatus,
    errorCode: keyof typeof ERROR_CODES,
    errorData?: any,
  ) {
    const { code, message } = ERROR_CODES[errorCode];
    const httpStatusCode =
      HttpStatus["UNAUTHORIZED"] ?? HttpStatus.INTERNAL_SERVER_ERROR;
    super(
      {
        message: message || `Sercvice Exception ${httpStatusCode} ${status}`,
      },
      httpStatusCode,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this._error = errorData || {};
    this._errorCode = code;
  }

  get error() {
    return this._error;
  }

  get errorCode() {
    return this._errorCode;
  }
}

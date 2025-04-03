import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { ErrorResponse } from "../response/error.response";
import { Response, Request } from "express";
import { RequestValidationException } from "../exceptions/request-validation.exception";
import { ServiceException } from "../exceptions/service.execption";
import { ApiResponse } from "../response/api.response";
import { ERROR_CODES } from "../constants/error-codes";

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger("AllExceptionFilter");

  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const { originalUrl } = request;

    // 로그 제외
    if (originalUrl !== "/favicon.ico") {
      this.logger.error(exception);
    }

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let responseData: ErrorResponse | ApiResponse = new ErrorResponse()
      .setMessage(ERROR_CODES.SYS_ERROR.message + " " + exception.message)
      .setErrorCode(ERROR_CODES.SYS_ERROR.code)
      .setError({});

    if (exception instanceof ServiceException) {
      status = exception.getStatus();
      responseData = new ErrorResponse()
        .setStatusCode("fail")
        .setMessage(exception.message)
        .setErrorCode(exception.errorCode)
        .setError(exception.error);

      // validation 검사 error
    } else if (exception instanceof RequestValidationException) {
      status = exception.getStatus();
      responseData = new ErrorResponse()
        .setStatusCode("error")
        .setMessage(exception.message)
        .setErrorCode("BAD_REQUEST")
        .setError(exception.error);

      // http exception 검사
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      responseData = new ErrorResponse()
        .setStatusCode("error")
        .setMessage(exception.message);
    }

    response.status(status).json(responseData);
  }
}

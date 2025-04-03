import { ApiResponse } from "./api.response";

export class ErrorResponse {
  private statusCode: "fail" | "error";
  private message: string;
  private errorCode: string | number;
  private error: any = {};

  constructor() {
    this.setStatusCode("error");
    this.setMessage("");
    return this;
  }

  setStatusCode(statusCode: "fail" | "error") {
    this.statusCode = statusCode;
    return this;
  }

  setMessage(message: string) {
    this.message = message;
    return this;
  }

  setErrorCode(code: string | number) {
    this.errorCode = code;
    return this;
  }

  setError(error: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.error = error;
    return this;
  }
}

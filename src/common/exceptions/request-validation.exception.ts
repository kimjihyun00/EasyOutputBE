import { BadRequestException } from "@nestjs/common";

export class RequestValidationException extends BadRequestException {
  private _error = {};
  constructor(error: any) {
    super();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this._error = error;
  }

  get error(): any {
    return this._error;
  }
}

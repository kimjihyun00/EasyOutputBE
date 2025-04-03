import { ValidationError } from "class-validator";
import { RequestValidationException } from "../exceptions/request-validation.exception";

export function ValidationExceptionFactory(errors: ValidationError[]) {
  const errorData = {};
  errors.forEach((error) => {
    errorData[error.property] = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      value: error.value,
      errors: (error.constraints && Object.values(error.constraints)) || [],
    };
  });
  // 바꾸자.
  throw new RequestValidationException(errorData);
}

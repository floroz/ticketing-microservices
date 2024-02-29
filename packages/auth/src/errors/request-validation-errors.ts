import { ValidationError } from "express-validator";
import { NormalizedErrorResponse } from "../types/errors";

export class RequestValidationError extends Error {
  constructor(private errors: ValidationError[]) {
    super();

    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }
  get normalizedResponse(): NormalizedErrorResponse {
    return {errors: this.errors.map((error) =>
      error.type === "field"
        ? { message: error.msg, field: error.path }
        : { message: error.msg }
    )};
  }
}
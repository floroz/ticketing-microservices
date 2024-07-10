import { NormalizedErrorResponse } from "../types/errors";
import { CustomError } from "./custom-error";

export class BadRequestError extends CustomError {
  public readonly statusCode: number = 400;
  constructor(message: string = "Bad Request") {
    super(message);
  }

  get normalizedResponse(): NormalizedErrorResponse {
    return {
      errors: [{ message: this.message }],
    };
  }
}

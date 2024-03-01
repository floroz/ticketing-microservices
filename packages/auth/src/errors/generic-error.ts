import { NormalizedErrorResponse } from "../types/errors";
import { CustomError } from "./custom-error";

export class GenericError extends CustomError {
  constructor(message: string, public statusCode: number = 400) {
    super(message);
  }

  get normalizedResponse(): NormalizedErrorResponse {
    return {
      errors: [{ message: this.message }]
    };
  }
}
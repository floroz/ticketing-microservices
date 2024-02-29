import { NormalizedErrorResponse } from "../types/errors";

export class GenericError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, GenericError.prototype);
  }

  get normalizedResponse(): NormalizedErrorResponse {
    return {
      errors: [{ message: this.message }]
    };
  }
}
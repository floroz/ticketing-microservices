import { NormalizedErrorResponse } from "../types/errors";

export abstract class CustomError extends Error {
  constructor(message: string) {
    super(message);

    Object.setPrototypeOf(this, new.target.prototype);
  }

  abstract get normalizedResponse(): NormalizedErrorResponse;
  abstract statusCode: number;
}

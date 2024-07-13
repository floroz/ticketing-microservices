import { CustomError } from "./custom-error";

export class ForbiddenError extends CustomError {
  public readonly statusCode: number = 403;
  constructor(message: string = "Forbidden operation.") {
    super(message);
  }
  get normalizedResponse() {
    return {
      errors: [{ message: this.message }],
    };
  }
}

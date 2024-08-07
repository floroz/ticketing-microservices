import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  public readonly statusCode: number = 404;
  constructor(message: string = "Not found") {
    super(message);
  }
  get normalizedResponse() {
    return {
      errors: [{ message: this.message }],
    };
  }
}

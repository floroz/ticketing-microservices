import { CustomError } from "./custom-error";

export class NotFoundError extends CustomError {
  public readonly statusCode: number = 404;
  constructor() {
    super("Route not found");
  }
  get normalizedResponse() {
    return {
      errors: [{ message: "Not Found" }],
    };
  }
}

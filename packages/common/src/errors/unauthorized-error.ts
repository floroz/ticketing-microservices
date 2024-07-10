import { CustomError } from "./custom-error";

export class UnauthorizedError extends CustomError {
  readonly statusCode: number = 401;
  constructor() {
    super("Not Authorized");
  }
  get normalizedResponse() {
    return {
      errors: [{ message: "Not Authorized" }],
    };
  }
}

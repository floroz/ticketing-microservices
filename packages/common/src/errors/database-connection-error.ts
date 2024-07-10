import { CustomError } from "./custom-error";

export class DatabaseConnectionError extends CustomError {
  private reason = "Error connecting to database";

  public readonly statusCode: number = 500;

  constructor() {
    super("Error connecting to database");
  }

  get normalizedResponse() {
    return {
      errors: [{ message: this.reason }],
    };
  }
}

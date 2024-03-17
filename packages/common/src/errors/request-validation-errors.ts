import { ValidationError } from "express-validator";
import { CustomError } from "./custom-error";

export class RequestValidationError extends CustomError {
  public statusCode: number = 400;

  constructor(private errors: ValidationError[]) {
    super("Invalid request parameters");
  }

  get normalizedResponse() {
    const response =  {errors: this.errors.map((error) =>
      error.type === "field"
        ? { message: error.msg, field: error.path }
        : { message: error.msg }
    )
    };
    console.log("Response is: ", response)
    return response;
  }

}
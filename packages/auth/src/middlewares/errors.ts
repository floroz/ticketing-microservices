import { Request, Response, NextFunction } from "express";
import { RequestValidationError } from "../errors/request-validation-errors";
import { DatabaseConnectionError } from "../errors/database-connection-error";
import { ErrorResponse } from "../types/errors";

export const errorHandlerMiddlewere = (
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequestValidationError) {
    const formattedErrors = err.errors.map((error) =>
      error.type === "field"
        ? { message: err.message, field: error.path }
        : { message: error.msg }
    );
    return res.status(400).send({errors: formattedErrors } satisfies ErrorResponse);
  }

  if (err instanceof DatabaseConnectionError) {
    const errorResponse: ErrorResponse = {errors: [{ message: err.reason }]};
    return res.status(500).send(errorResponse);
  }

  res.status(400).send({ errors: [{message: err.message}] } satisfies ErrorResponse);
};

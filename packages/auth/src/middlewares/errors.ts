import { Request, Response, NextFunction } from "express";
import { RequestValidationError } from "../errors/request-validation-errors";
import { DatabaseConnectionError } from "../errors/database-connection-error";
import { GenericError } from "../errors/generic-error";

export const errorHandlerMiddlewere = (
  err: Error,
  _: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof RequestValidationError) {
  
    return res.status(400).send(err.normalizedResponse);
  }

  if (err instanceof DatabaseConnectionError) {
    return res.status(500).send(err.normalizedResponse);
  }

  if (err instanceof GenericError) {
    return res.status(400).send(err.normalizedResponse);
  }

  res.status(400).send(new GenericError(err.message ?? "Something went wrong").normalizedResponse);
};

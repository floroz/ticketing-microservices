import { Request, Response, NextFunction } from "express";
import { GenericError } from "../errors/generic-error";
import { CustomError } from "../errors/custom-error";
import { logger } from "../logger";

export const errorHandlerMiddlewere = (
  err: Error,
  _: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof CustomError) {
    logger.debug("Custom Error", err);
    return res.status(err.statusCode).send(err.normalizedResponse);
  }

  logger.debug("Generic Error - 500", err);
  const error = new GenericError("Something went wrong", 500);
  return res.status(error.statusCode).send(error.normalizedResponse);
};

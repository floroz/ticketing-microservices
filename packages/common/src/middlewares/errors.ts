import { Request, Response, NextFunction } from "express";
import { GenericError } from "../errors/generic-error";
import { CustomError } from "../errors/custom-error";

export const errorHandlerMiddlewere = (
  err: Error,
  _: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send(err.normalizedResponse);
  }


  return res.status(400).send(new GenericError('Something went wrong').normalizedResponse);
};

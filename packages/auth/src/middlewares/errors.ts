import { Request, Response, NextFunction } from 'express';
import { RequestValidationError } from '../errors/request-validation-errors';
import { DatabaseConnectionError } from '../errors/database-connection-error';

export const errorHandlerMiddlewere = (err: Error, req: Request, res: Response, next: NextFunction) => { 
  if (err instanceof RequestValidationError) {
     const formattedErrors = err.errors.map((error) => {
      if (error.type === 'field') {
        return { message: error.msg, field: error.path };
      }
    });
    return res.status(400).send({ errors: formattedErrors });
  }

  if (err instanceof DatabaseConnectionError) {
    return res.status(400).send({ errors: [err.message] });
  }

  res.status(400).send({ errors: [err.message] });
}
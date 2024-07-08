import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/unauthorized-error";

export const requireAuth = () => {
  return async (req: Request, _: Response, next: NextFunction) => {
    if (!req.currentUser) {
      return next(new UnauthorizedError());
    }
    next();
  };
};

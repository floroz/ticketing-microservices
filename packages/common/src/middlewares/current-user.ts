import { NextFunction, Request, Response } from "express";
import { JWTService, UserPayload } from "../services/jwt";
import { GenericError } from "../errors/generic-error";

declare global {
  namespace Express {
    interface Request {
      currentUser: UserPayload | null;
    }
  }
}

const currentUserMiddleware = (jwtService: JWTService) => {
  return async (req: Request, _: Response, next: NextFunction) => {
    if (!req.session?.token) {
      console.log("No token found in the session");
      return next();
    }

    try {
      const payload = jwtService.verify(req.session.token);
      req.currentUser = payload;
    } catch (err) {
      return next(new GenericError("Something went wrong", 500));
    }

    next();
  };
};

export { currentUserMiddleware };

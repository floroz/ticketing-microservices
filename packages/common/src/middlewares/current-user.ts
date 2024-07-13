import { NextFunction, Request, Response } from "express";
import { JWTService, UserPayload } from "../services/jwt";
import { GenericError } from "../errors/generic-error";
import { logger } from "../logger";

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
      logger.debug("No token found in the session");
      return next();
    }

    try {
      const payload = jwtService.verify(req.session.token);
      req.currentUser = payload;
      logger.debug("Token verified");
    } catch (err) {
      logger.error("Token verification failed");
      return next(new GenericError("Something went wrong", 500));
    }

    next();
  };
};

export { currentUserMiddleware };

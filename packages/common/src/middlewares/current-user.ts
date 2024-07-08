import { NextFunction, Request, Response } from "express";
import { JWTService, UserPayload } from "../services/jwt";
import { User } from "../models/user";

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

const currentUserMiddleware = (jwtService: JWTService) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.session ?? {};

    if (!token) {
      req.session = null;
      req.currentUser = undefined;
      return next();
    }

    const payload = jwtService.verify(token);

    if (!payload) {
      console.log("Invalid token");
      req.session = null;
      req.currentUser = undefined;
      return next();
    }

    const userDoc = await User.findOne({ email: payload.email });

    if (!userDoc) {
      req.session = null;
      req.currentUser = undefined;
      return next();
    }

    req.currentUser = userDoc;
    return next();
  };
};

export { currentUserMiddleware };

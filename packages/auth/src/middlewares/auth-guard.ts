import { Request, Response, NextFunction } from "express";
import { JWTService, UserPayload } from "../services/jwt";
import { User } from "../models/user";
import { UnauthorizedError } from "../errors/unauthorized-error";

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const authGuardMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const { token } = req.session ?? {};

    // check if token exists
    if (!token) {
      console.log("No token found");
      return next(new UnauthorizedError());
    }

    // verify JWT signature
    const payload = JWTService.verify(token);
    if (!payload) {
      console.log("Invalid token")
      req.session = null;
      return next(new UnauthorizedError());
    }

    // retrieve user from DB
    const userDoc = await User.findOne({ email: payload.email });

    if (!userDoc) {
      return next(next(new UnauthorizedError()));
    }

    req.currentUser = userDoc;
    return next();
  } catch (error) {
    console.log(error);
    return next(error);
  }
};

import { NextFunction, Request, Response, Router } from "express";
import { JWTService } from "../services/jwt";
import { User } from "../models/user";
import { GenericError } from "../errors/generic-error";

const router = Router();

router.get(
  "/current-user",
  async (req: Request, res: Response, next: NextFunction) => {
    const { token } = req.session ?? {};

    console.log("session", req.session);

    if (!token) {
      return res.send({ currentUser: null });
    }

    try {
      if (!JWTService.verifyToken(token)) {
        return res.send({ currentUser: null });
      }

      const user = JWTService.decodeToken(token);

      const userDoc = await User.findOne({ email: user.email });

      if (!userDoc) { 
        throw new GenericError('User not found');
      }

      return res.send(userDoc);
    } catch (error) {
      console.log(error);
      return next(error);
    }
  }
);

export { router as currentUserRouter };

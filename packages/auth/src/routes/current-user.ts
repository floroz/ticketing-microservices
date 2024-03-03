import { Request, Response, Router } from "express";
import { JWTService } from "../services/jwt";
import { User } from "../models/user";


const router = Router();

router.get(
  "/current-user",
  async (req: Request, res: Response) => {
    const { token } = req.session ?? {};

    if (!token) {
      return res.status(200).send({ currentUser: null });
    }

    const payload = JWTService.verify(token);

    if (!payload) {
      console.log("Invalid token")
      req.session = null;
       return res.status(200).send({ currentUser: null });
    }

    const userDoc = await User.findOne({ email: payload.email });

    if (!userDoc) {
      return res.status(200).send({ currentUser: null });
    }


    return res.status(200).send({ currentUser: userDoc ?? null });
  }
);

export { router as currentUserRouter };

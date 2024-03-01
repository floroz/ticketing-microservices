import { Request, Response, Router } from "express";
import { authGuardMiddleware } from "../middlewares/auth-guard";
import { UserPayload } from "../services/jwt";

declare global {
  namespace Express {
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

const router = Router();

router.get(
  "/current-user",
  [authGuardMiddleware],
  async (req: Request, res: Response) => {
    const { currentUser } = req

    if (!currentUser) {
      return res.status(200).send({currentUser: null});
    }

    return res.status(200).send({
      currentUser
    });
  }
);

export { router as currentUserRouter };

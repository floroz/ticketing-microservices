import { Request, Response, Router } from "express";
import { currentUserMiddleware } from "floroz-ticketing-common";
import { jwtService } from "../services/jwt";

const router = Router();

router.get(
  "/current-user",
  currentUserMiddleware(jwtService),
  (req: Request, res: Response) => {
    if (!req.currentUser) {
      return res.status(200).send({ currentUser: null });
    }

    return res.status(200).send({ currentUser: req.currentUser });
  }
);

export { router as currentUserRouter };

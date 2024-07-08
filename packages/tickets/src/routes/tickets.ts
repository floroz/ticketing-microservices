import { Router, Request, Response } from "express";
import {
  JWTService,
  currentUserMiddleware,
  requireAuth,
} from "floroz-ticketing-common";

function createRouter(jwtService: JWTService) {
  const router = Router();

  router.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello, ticket!" });
  });

  router.get("/:id", (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello, " + `${req.params.id}` });
  });

  router.post(
    "/",
    currentUserMiddleware(jwtService),
    requireAuth(),
    (req: Request, res: Response) => {
      res.status(201).json({});
    }
  );

  router.put(
    "/:id",
    currentUserMiddleware(jwtService),
    // requireAuth(),
    (req: Request, res: Response) => {
      res.status(200).json({});
    }
  );

  return router;
}

export { createRouter };

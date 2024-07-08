import { Router, Request, Response } from "express";
import { JWTService, authGuardMiddleware } from "floroz-ticketing-common";

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
    authGuardMiddleware(jwtService),
    (req: Request, res: Response) => {
      res.status(201).json({});
    }
  );

  router.put(
    "/:id",
    authGuardMiddleware(jwtService),
    (req: Request, res: Response) => {
      res.status(200).json({});
    }
  );

  return router;
}

export { createRouter };

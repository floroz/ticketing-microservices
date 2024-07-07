import { Router, Request, Response } from "express";
import { authGuardMiddleware } from "floroz-ticketing-common";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Hello, ticket!");
});

router.get("/:id", (req: Request, res: Response) => {
  res.send("Hello, ticket!");
});

router.post("/", authGuardMiddleware, (req: Request, res: Response) => {
  res.send("Hello, ticket!");
});

router.put("/:id", authGuardMiddleware, (req: Request, res: Response) => {
  res.send("Hello, ticket!");
});

export { router };

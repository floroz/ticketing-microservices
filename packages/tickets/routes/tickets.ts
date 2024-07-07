import { Router, Request, Response } from "express";
import { authGuardMiddleware } from "floroz-ticketing-common";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, ticket!" });
});

router.get("/:id", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, " + `${req.params.id}` });
});

router.post("/", authGuardMiddleware, (req: Request, res: Response) => {
  res.status(201).json({});
});

router.put("/:id", authGuardMiddleware, (req: Request, res: Response) => {
  res.status(200).json({});
});

export { router };

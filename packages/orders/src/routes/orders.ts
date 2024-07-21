import { Router, Request, Response } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { logger } from "../logger";
import { NATS } from "floroz-ticketing-common";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

router.post(
  "/",
  [
    body("ticketId")
      .not()
      .isEmpty()
      .withMessage("Ticket ID is required")
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("Invalid ticket ID"),
  ],
  (req: Request, res: Response) => {
    res.send("Hello");
  }
);

router.put("/:id", (req: Request, res: Response) => {
  res.send("Hello");
});

router.delete("/:id", (req: Request, res: Response) => {
  res.send("Hello");
});

export { router as ordersRouter };

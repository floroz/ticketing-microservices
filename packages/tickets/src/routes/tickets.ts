import { Router, Request, Response } from "express";
import {
  GenericError,
  requireAuth,
  validateRequestMiddleware,
} from "floroz-ticketing-common";
import { body } from "express-validator";
import crypto from "node:crypto";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, ticket!" });
});

router.get("/:id", (req: Request, res: Response) => {
  res.status(200).json({ message: "Hello, " + `${req.params.id}` });
});

router.post(
  "/",
  [
    requireAuth(),
    body("title").not().isEmpty().isString().withMessage("Title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
    validateRequestMiddleware,
  ],
  (req: Request, res: Response) => {
    const { title, price } = req.body;
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();

    // const ticket = Ticket.create({ title, price, id, createdAt, updatedAt });
    res.status(201).json({ title, price, id, createdAt, updatedAt });
  }
);

router.put(
  "/:id",
  [
    requireAuth(),
    body("title").isString().optional(),
    body("price")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Price must be greater than 0"),
    validateRequestMiddleware,
  ],
  (req: Request, res: Response) => {
    const { title, price } = req.body;
    const { id } = req.params;

    if (!title && !price) {
      throw new GenericError("Title or price is required", 400);
    }

    const createdAt = new Date().toISOString();
    const updatedAt = new Date().toISOString();

    res.status(200).json({ title, price, id, createdAt, updatedAt });
  }
);

export { router as ticketRouter };

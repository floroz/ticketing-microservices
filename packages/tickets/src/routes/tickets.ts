import { Router, Request, Response } from "express";
import {
  GenericError,
  requireAuth,
  validateRequestMiddleware,
  Ticket,
} from "floroz-ticketing-common";
import { body } from "express-validator";

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
    body("currency")
      .not()
      .isEmpty()
      .isString()
      .withMessage("Currency is required"),
    validateRequestMiddleware,
  ],
  async (req: Request, res: Response) => {
    const { title, price, currency } = req.body;

    try {
      const ticket = await Ticket.create({
        title,
        price,
        currency,
        userId: req.currentUser?.id,
      });

      res.status(201).json({
        userId: ticket.userId,
        title: ticket.title,
        price: ticket.price,
        currency: ticket.currency,
        id: ticket.id,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new GenericError(error.message, 500);
      }
      console.error({ error });
      throw new GenericError("Error in creating a ticket.", 500);
    }
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

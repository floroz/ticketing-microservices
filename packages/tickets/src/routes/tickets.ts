import { Router, Request, Response } from "express";
import {
  GenericError,
  requireAuth,
  validateRequestMiddleware,
  Ticket,
  BadRequestError,
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
    const { id } = req.params;

    try {
      const updatedTicket = await Ticket.findByIdAndUpdate(
        id,
        { title, price, currency },
        { new: true, runValidators: true }
      );

      if (!updatedTicket) {
        throw new BadRequestError("Invalid ticket id.");
      }

      res.send(updatedTicket);
    } catch (error) {
      console.error({ error });
      throw new GenericError("Error in updating the ticket.", 500);
    }
  }
);

export { router as ticketRouter };

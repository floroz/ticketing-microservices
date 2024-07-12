import { Router, Request, Response } from "express";
import {
  GenericError,
  requireAuth,
  validateRequestMiddleware,
  Ticket,
  NotFoundError,
} from "floroz-ticketing-common";
import { body } from "express-validator";

const validationMiddleware = [
  body("title").not().isEmpty().isString().withMessage("Title is required"),
  body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
  body("currency")
    .not()
    .isEmpty()
    .isString()
    .withMessage("Currency is required"),
  validateRequestMiddleware,
];
const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).send({ message: "Hello, ticket!" });
});

router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new NotFoundError();
    }

    res.status(200).send(ticket);
  } catch (error) {
    console.error({ error });
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new GenericError("Error in fetching the ticket.", 500);
  }
});

router.post(
  "/",
  [requireAuth(), ...validationMiddleware],
  async (req: Request, res: Response) => {
    const { title, price, currency } = req.body;

    try {
      const ticket = await Ticket.build({
        title,
        price,
        currency,
        userId: req.currentUser?.id,
      }).save();

      res.status(201).send({
        userId: ticket.userId,
        title: ticket.title,
        price: ticket.price,
        currency: ticket.currency,
        id: ticket.id,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      });
    } catch (error) {
      console.error({ error });
      if (error instanceof Error) {
        throw new GenericError(error.message, 500);
      }
      throw new GenericError("Error in creating a ticket.", 500);
    }
  }
);

router.put(
  "/:id",
  [requireAuth(), ...validationMiddleware],
  async (req: Request, res: Response) => {
    const { title, price, currency } = req.body;
    const { id } = req.params;

    try {
      const updatedTicket = await Ticket.findByIdAndUpdate(
        id,
        { title, price, currency },
        { new: true }
      );

      if (!updatedTicket) {
        throw new NotFoundError();
      }

      res.send(updatedTicket);
    } catch (error) {
      console.error({ error });
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new GenericError("Error in updating the ticket.", 500);
    }
  }
);

export { router as ticketRouter };

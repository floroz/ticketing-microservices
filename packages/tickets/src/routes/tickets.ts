import { Router, Request, Response, NextFunction } from "express";
import {
  GenericError,
  requireAuth,
  validateRequestMiddleware,
  Ticket,
  NotFoundError,
  ForbiddenError,
  TicketCreatedEvent,
} from "floroz-ticketing-common";
import { body } from "express-validator";
import { TicketCreatedProducer } from "../events/producers/ticket-created-producer";
import { NATS } from "floroz-ticketing-common";
import { logger } from "../logger";

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

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { offset = 0, limit = 100 } = req.query;

    const tickets = await Ticket.find({})
      .skip(Number(offset))
      .limit(Number(limit));

    return res.status(200).send({ tickets, offset, limit });
  } catch (error) {
    return next(new GenericError("Error in fetching the tickets.", 500));
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const ticket = await Ticket.findById(id);

    if (!ticket) {
      return next(new NotFoundError());
    }

    res.status(200).send(ticket);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return next(error);
    }
    return next(new GenericError("Error in fetching the ticket.", 500));
  }
});

router.post(
  "/",
  [requireAuth(), ...validationMiddleware],
  async (req: Request, res: Response, next: NextFunction) => {
    const ticketCreatedProducer = new TicketCreatedProducer(NATS.client);

    const { title, price, currency } = req.body;

    try {
      const ticket = await Ticket.build({
        title,
        price,
        currency,
        userId: req.currentUser?.id,
      }).save();

      try {
        const eventData: TicketCreatedEvent["data"] = {
          id: ticket.id,
          userId: ticket.userId,
          title: ticket.title,
          price: ticket.price,
          currency: ticket.currency,
          updatedAt: ticket.updatedAt,
          createdAt: ticket.createdAt,
        };
        await ticketCreatedProducer.publish(eventData);
        logger.info(
          "Ticket created event published",
          JSON.stringify(eventData)
        );
      } catch (error) {
        logger.error("Error in publishing the ticket created event.", error);
        return next(
          new GenericError("Error in publishing the ticket created event.", 500)
        );
      }

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
      logger.error("Error in creating a ticket.", error);
      if (error instanceof Error) {
        return next(new GenericError(error.message, 500));
      }
      return next(new GenericError("Error in creating a ticket.", 500));
    }
  }
);

router.put(
  "/:id",
  [requireAuth(), ...validationMiddleware],
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, price, currency } = req.body;
    const { id } = req.params;

    const userId = req.currentUser!.id;

    try {
      const ticket = await Ticket.findById(id);

      if (!ticket) {
        return next(new NotFoundError());
      }

      // prevent updating if the user is not the owner of the ticket
      if (userId !== ticket?.userId) {
        return next(new ForbiddenError());
      }

      const updated = await ticket.set({ title, price, currency }).save();

      res.send(updated);
    } catch (error) {
      if (error instanceof NotFoundError || error instanceof GenericError) {
        return next(error);
      }
      return next(new GenericError("Error in updating the ticket.", 500));
    }
  }
);

export { router as ticketRouter };

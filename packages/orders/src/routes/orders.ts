import { Router, Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { logger } from "../logger";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  validateRequestMiddleware,
} from "floroz-ticketing-common";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";

const EXPIRATION_MS_SECONDS = 15 * 60 * 1000;

const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.send("Hello");
});

router.post(
  "/",
  [
    body("ticketId")
      .exists()
      .notEmpty()
      .withMessage("Ticket ID is required")
      .isMongoId()
      .withMessage("Invalid ticket ID"),
    validateRequestMiddleware,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const { ticketId } = req.body;
    const session = await mongoose.startSession();

    session.startTransaction();
    try {
      const ticket = await Ticket.findById(ticketId);

      // check that ticket exists
      if (!ticket) {
        throw new NotFoundError();
      }

      const existingOrder = await ticket.isReserved();

      if (existingOrder) {
        throw new BadRequestError("Ticket is already reserved.");
      }

      const expiresAt = new Date(Date.now() + EXPIRATION_MS_SECONDS); // 15 minutes expiration

      const order = Order.build({
        ticket: ticket,
        userId: req.currentUser?.id,
        expiresAt,
        status: OrderStatus.Created,
      });
      await order.save({ session });

      // TODO: publish created order

      await session.commitTransaction();

      return res.status(201).send({});
    } catch (error) {
      logger.error(error, "Error creating the order.");
      await session.abortTransaction();
      return next(error);
    } finally {
      await session.endSession();
    }
  }
);

router.put("/:id", (req: Request, res: Response) => {
  res.send("Hello");
});

router.delete("/:id", (req: Request, res: Response) => {
  res.send("Hello");
});

export { router as ordersRouter };

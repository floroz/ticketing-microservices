import { Router, Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { logger } from "../logger";
import {
  BadRequestError,
  NATS,
  NotFoundError,
  OrderStatus,
  UnauthorizedError,
  validateRequestMiddleware,
} from "floroz-ticketing-common";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";
import {
  OrderCancelledProducer,
  OrderCreatedProducer,
} from "../events/order-producers";

const EXPIRATION_MS_SECONDS = 15 * 60 * 1000;

const router = Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orders = await Order.find({
      userId: req.currentUser?.id,
    }).populate("ticket");
    return res.status(200).send(orders);
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const order = await Order.findById(id).populate("ticket");

    if (!order) {
      throw new NotFoundError();
    }

    if (order?.userId !== req.currentUser?.id) {
      throw new UnauthorizedError();
    }

    return res.status(200).send(order);
  } catch (error) {
    return next(error);
  }
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

      const producer = new OrderCreatedProducer(NATS.client);

      await producer.publish({
        expiresAt: order.expiresAt.toISOString(),
        id: order.id,
        userId: req.currentUser?.id,
        ticket: {
          currency: ticket.currency,
          id: ticket.id,
          price: ticket.price,
        },
      });

      await session.commitTransaction();

      return res.status(201).send(order);
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

router.patch(
  "/:id",
  [
    body("status")
      .exists()
      .notEmpty()
      .withMessage("Status is required")
      .isIn(Object.values(OrderStatus))
      .withMessage("Invalid status"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new BadRequestError("Invalid order ID");
      }

      const order = await Order.findById(id).populate("ticket");
      if (!order) {
        throw new NotFoundError();
      }

      if (order.userId !== req.currentUser?.id) {
        throw new UnauthorizedError();
      }

      order.status = status;
      await order.save({ session });
      const producer = new OrderCancelledProducer(NATS.client);

      await producer.publish({
        id: order.id,
        ticket: {
          currency: order.ticket.currency,
          id: order.ticket.id,
          price: order.ticket.price,
        },
        userId: req.currentUser.id,
      });
      await session.commitTransaction();
      return res.status(200).send(order);
    } catch (error) {
      await session.abortTransaction;
      logger.error(error, "Error patching the order.");
      return next(error);
    } finally {
      await session.endSession();
    }
  }
);

export { router as ordersRouter };

import { Router, Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import mongoose from "mongoose";
import { logger } from "../logger";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  UnauthorizedError,
  validateRequestMiddleware,
} from "floroz-ticketing-common";
import { Ticket } from "../models/ticket";
import { Order } from "../models/order";

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

    try {
      const order = await Order.findById(id).populate("ticket");
      if (!order) {
        throw new NotFoundError();
      }

      if (order.userId !== req.currentUser?.id) {
        throw new UnauthorizedError();
      }

      order.status = status;
      // TODO: publish updated order
      await order.save();
      return res.status(200).send(order);
    } catch (error) {
      logger.error(error, "Error patching the order.");
      return next(error);
    }
  }
);

export { router as ordersRouter };

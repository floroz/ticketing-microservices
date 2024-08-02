import { NextFunction, Request, Response, Router } from "express";
import { logger } from "../logger";
import { Order } from "../models/order-model";
import {
  ForbiddenError,
  NotFoundError,
  OrderStatus,
  UnauthorizedError,
  validateRequestMiddleware,
} from "floroz-ticketing-common";
import { body } from "express-validator";

const router = Router();

router.post(
  "/",
  [
    body("orderId")
      .isString()
      .notEmpty()
      .withMessage("orderId must be provided"),
    body("token")
      .isString()
      .notEmpty()
      .withMessage("Stripe token must be provided"),
    validateRequestMiddleware,
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.body;

    try {
      const order = await Order.findById(orderId);

      // check if order exists
      if (!order) {
        throw new NotFoundError();
      }

      // check if user is authorized to pay for this order
      if (req.currentUser!.id !== order.userId) {
        throw new UnauthorizedError();
      }

      // check if order was previously cancelled before allowing payment
      if (order.status === OrderStatus.Cancelled) {
        throw new ForbiddenError("Order is already cancelled.");
      }

      // validate token

      // send request to STRIPE API

      // create a transaction record

      res.status(201).send({ success: true });
    } catch (error) {
      logger.error({ error }, "Error creating payment");
      next(error);
    }
  }
);

export { router as paymentsRouter };

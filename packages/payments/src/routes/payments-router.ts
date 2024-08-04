import { NextFunction, Request, Response, Router } from "express";
import { logger } from "../logger";
import { Order } from "../models/order-model";
import {
  ForbiddenError,
  GenericError,
  NotFoundError,
  OrderStatus,
  UnauthorizedError,
  validateRequestMiddleware,
} from "floroz-ticketing-common";
import { body } from "express-validator";
import { stripe } from "../services/stripe";
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
    const { orderId, token } = req.body;

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

      // send request to STRIPE API
      try {
        await stripe.charges.create({
          // TODO: add logic to handle ticket prices in different currencies
          currency: order.tickets[0].currency,
          amount:
            order.tickets.reduce((acc, ticket) => acc + ticket.price, 0) * 100,
          source: token,
          description: `Payment for order ${order.id}`,
        });
      } catch (error) {
        logger.error({ error }, "Error processing payment with Stripe");
        return next(new GenericError("Error processing payment"));
      }

      // create a transaction record

      res.status(201).send({ success: true });
    } catch (error) {
      logger.error({ error }, "Error creating payment");
      next(error);
    }
  }
);

export { router as paymentsRouter };

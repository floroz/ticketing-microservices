import {
  OrderExpiredEvent,
  Consumer,
  Topics,
  NotFoundError,
  OrderStatus,
  NATS,
} from "floroz-ticketing-common";
import { QUEUE_GROUP_NAME } from "../constants";
import { Message } from "node-nats-streaming";
import { Order } from "../models/order-model";
import { logger } from "../logger";
import { OrderCancelledProducer } from "./orders-producers";
import mongoose from "mongoose";

export class OrderExpiredConsumer extends Consumer<OrderExpiredEvent> {
  readonly topic = Topics.OrderExpired;
  readonly queueGroup = QUEUE_GROUP_NAME;

  async onMessage(
    data: OrderExpiredEvent["data"],
    message: Message
  ): Promise<void> {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const order = await Order.findById(data.id).populate("ticket");

      // No order found - do nothing
      if (!order) {
        message.ack();
        throw new NotFoundError();
      }

      // Already cancelled or completed - do nothing
      if (
        order.status === OrderStatus.Complete ||
        order.status === OrderStatus.Cancelled
      ) {
        message.ack();
        return;
      }

      // Update order status
      order.set({ status: OrderStatus.Cancelled });
      await order.save({ session });

      // Publish update to consumers
      const producer = new OrderCancelledProducer(NATS.client);
      await producer.publish({
        id: order.id,
        ticket: {
          currency: order.ticket.currency,
          id: order.ticket.id,
          price: order.ticket.price,
        },
        expiresAt: order.expiresAt.toISOString(),
        status: OrderStatus.Cancelled,
        userId: order.userId,
      });

      logger.info(`${QUEUE_GROUP_NAME}: Order cancelled`, order.id);

      await session.commitTransaction();
      message.ack();
    } catch (error) {
      logger.error(error, "Error deleting order");
      await session.abortTransaction();
    } finally {
      session.endSession();
    }
  }
}

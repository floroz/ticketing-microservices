import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  Consumer,
  Topics,
  OrderStatus,
} from "floroz-ticketing-common";
import { Message } from "node-nats-streaming";
import { QUEUE_GROUP_NAME } from "../constants";
import { Order } from "../models/order-model";
import { logger } from "../logger";

export class OrderCreatedEventConsumer extends Consumer<OrderCreatedEvent> {
  readonly queueGroup = QUEUE_GROUP_NAME;
  readonly topic = Topics.OrderCreated;

  async onMessage(data: OrderCreatedEvent["data"], message: Message) {
    try {
      logger.info({ data }, "Order created event received");
      const order = Order.build({
        id: data.id,
        userId: data.userId,
        status: data.status,
        version: data.version,
        tickets: [
          {
            id: data.ticket.id,
            price: data.ticket.price,
            currency: data.ticket.currency,
          },
        ],
      });
      await order.save();
      message.ack();
    } catch (error) {
      logger.error({ error }, "Error processing order created event");
    }
  }
}

export class OrderCancelledEventConsumer extends Consumer<OrderCancelledEvent> {
  readonly queueGroup = QUEUE_GROUP_NAME;
  readonly topic = Topics.OrderCancelled;

  async onMessage(data: OrderCancelledEvent["data"], message: Message) {
    try {
      logger.info({ data }, "Order cancelled event received");

      // find if order exists
      const order = await Order.findById(data.id);
      if (!order) {
        // if it doesn't acknowledge the request.
        message.ack();
        logger.warn({ data }, "Order not found");
        return;
      }

      // check if order has been paid already
      if (
        order.status === OrderStatus.Complete ||
        order.status === OrderStatus.Cancelled
      ) {
        logger.warn({ data }, "Order already paid");
        // TODO: inform consumer that order is already paid
        message.ack();
        return;
      }

      // update order
      order.set({ status: OrderStatus.Cancelled });
      await order.save();
      message.ack();
    } catch (error) {
      logger.error({ error }, "Error processing order cancelled event");
    }
  }
}

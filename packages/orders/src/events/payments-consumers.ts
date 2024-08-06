import {
  Consumer,
  OrderStatus,
  PaymentCreatedEvent,
  Topics,
} from "floroz-ticketing-common";
import { QUEUE_GROUP_NAME } from "../constants";
import { Message } from "node-nats-streaming";
import { Order } from "../models/order-model";
import { logger } from "../logger";

export class PaymentCreatedConsumer extends Consumer<PaymentCreatedEvent> {
  readonly topic = Topics.PaymentCreated;
  readonly queueGroup = QUEUE_GROUP_NAME;

  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    try {
      const order = await Order.findById(data.orderId);

      if (
        !order ||
        order.status === OrderStatus.Complete ||
        order.status === OrderStatus.Cancelled
      ) {
        logger.warn(
          { orderId: data.orderId, orderStatus: order?.status },
          "Order status cannot be updated to complete"
        );
        return;
      }

      order.set({ status: OrderStatus.Complete });
    } catch (error) {
      logger.error({ error }, "Error processing payment created event");
    }
  }
}

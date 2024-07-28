import {
  Consumer,
  OrderCreatedEvent,
  OrderCancelledEvent,
  Topics,
  OrderUpdatedEvent,
} from "floroz-ticketing-common";
import { QUEUE_GROUP_NAME } from "../constants";
import { Message } from "node-nats-streaming";

export class OrderCreatedConsumer extends Consumer<OrderCreatedEvent> {
  readonly queueGroup = QUEUE_GROUP_NAME;
  readonly topic = Topics.OrderCreated;

  async onMessage(data: OrderCreatedEvent["data"], message: Message) {}
}

export class OrderUpdatedConsumer extends Consumer<OrderUpdatedEvent> {
  readonly queueGroup = QUEUE_GROUP_NAME;
  readonly topic = Topics.OrderUpdated;

  async onMessage(data: OrderUpdatedEvent["data"], message: Message) {}
}

export class OrderDeletedConsumer extends Consumer<OrderCancelledEvent> {
  readonly queueGroup = QUEUE_GROUP_NAME;
  readonly topic = Topics.OrderCancelled;

  async onMessage(data: OrderCancelledEvent["data"], message: Message) {}
}

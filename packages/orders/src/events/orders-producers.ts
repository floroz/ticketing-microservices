import {
  Producer,
  Topics,
  OrderCreatedEvent,
  OrderCancelledEvent,
} from "floroz-ticketing-common";

export class OrderCreatedProducer extends Producer<OrderCreatedEvent> {
  readonly topic = Topics.OrderCreated;
}

export class OrderCancelledProducer extends Producer<OrderCancelledEvent> {
  readonly topic = Topics.OrderCancelled;
}

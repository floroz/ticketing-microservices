import {
  Producer,
  Topics,
  OrderCreatedEvent,
  OrderDeletedEvent,
} from "floroz-ticketing-common";

export class OrderCreatedProducer extends Producer<OrderCreatedEvent> {
  readonly topic = Topics.OrderCreated;
}

export class OrderCancelledProducer extends Producer<OrderDeletedEvent> {
  readonly topic = Topics.OrderCancelled;
}

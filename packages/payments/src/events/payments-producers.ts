import { Producer, PaymentCreatedEvent, Topics } from "floroz-ticketing-common";

export class PaymentsProducer extends Producer<PaymentCreatedEvent> {
  readonly topic = Topics.PaymentCreated;
}

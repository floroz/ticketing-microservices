import { TicketCreatedEvent, Producer, Topics } from "floroz-ticketing-common";

export class TicketCreatedProducer extends Producer<TicketCreatedEvent> {
  readonly topic = Topics.TicketCreated;
}

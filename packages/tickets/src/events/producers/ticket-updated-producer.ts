import { TicketUpdatedEvent, Producer, Topics } from "floroz-ticketing-common";

export class TicketUpdatedProducer extends Producer<TicketUpdatedEvent> {
  readonly topic = Topics.TicketUpdated;
}

import { TicketDeletedEvent, Producer, Topics } from "floroz-ticketing-common";

export class TicketDeletedProducer extends Producer<TicketDeletedEvent> {
  readonly topic = Topics.TicketDeleted;
}

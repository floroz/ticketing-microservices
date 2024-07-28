import {
  TicketCreatedEvent,
  Producer,
  Topics,
  TicketUpdatedEvent,
  TicketDeletedEvent,
} from "floroz-ticketing-common";

export class TicketCreatedProducer extends Producer<TicketCreatedEvent> {
  readonly topic = Topics.TicketCreated;
}

export class TicketUpdatedProducer extends Producer<TicketUpdatedEvent> {
  readonly topic = Topics.TicketUpdated;
}

export class TicketDeletedProducer extends Producer<TicketDeletedEvent> {
  readonly topic = Topics.TicketDeleted;
}

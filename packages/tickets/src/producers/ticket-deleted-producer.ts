import { TicketDeletedEvent, Producer, Topics } from "floroz-ticketing-common";
import { Stan } from "node-nats-streaming";

export class TicketDeletedProducer extends Producer<TicketDeletedEvent> {
  readonly topic = Topics.TicketDeleted;

  constructor(client: Stan) {
    super(client);
  }

  logMessage(event: TicketDeletedEvent) {
    console.log(`Ticket deleted event: ${JSON.stringify(event)}`);
  }
}

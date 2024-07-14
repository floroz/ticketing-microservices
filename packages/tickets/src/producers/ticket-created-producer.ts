import { TicketCreatedEvent, Producer, Topics } from "floroz-ticketing-common";
import { Stan } from "node-nats-streaming";

export class TicketCreatedProducer extends Producer<TicketCreatedEvent> {
  readonly topic = Topics.TicketCreated;

  constructor(client: Stan) {
    super(client);
  }

  logMessage(event: TicketCreatedEvent) {
    console.log(`Ticket created event: ${JSON.stringify(event)}`);
  }
}

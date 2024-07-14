import { TicketUpdatedEvent, Producer, Topics } from "floroz-ticketing-common";
import { Stan } from "node-nats-streaming";

export class TicketUpdatedProducer extends Producer<TicketUpdatedEvent> {
  readonly topic = Topics.TicketUpdated;

  constructor(client: Stan) {
    super(client);
  }

  logMessage(event: TicketUpdatedEvent) {
    console.log(`Ticket updated event: ${JSON.stringify(event)}`);
  }
}

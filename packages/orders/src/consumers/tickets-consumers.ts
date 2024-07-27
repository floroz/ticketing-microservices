import {
  Consumer,
  NotFoundError,
  TicketCreatedEvent,
  TicketDeletedEvent,
  TicketUpdatedEvent,
  Topics,
} from "floroz-ticketing-common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../models/ticket";
import { logger } from "../logger";

const QUEUE_GROUP_NAME = "orders-service";

export class TicketCreatedConsumer extends Consumer<TicketCreatedEvent> {
  readonly queueGroup = QUEUE_GROUP_NAME;
  readonly topic = Topics.TicketCreated;

  async onMessage(data: TicketCreatedEvent["data"], message: Message) {
    // check if version is the next in sequence
    // if not, abort
    // TODO: implement
    const lastVersion = 1; /*TODO */

    // create new ticket
    const ticket = Ticket.build({
      id: data.id,
      title: data.title,
      price: data.price,
      currency: data.currency,
      version: -1,
    });

    try {
      await ticket.save({});
      logger.info(`${QUEUE_GROUP_NAME}: Ticket created`, ticket);
      message.ack();
    } catch (error) {}
  }
}
export class TicketUpdatedConsumer extends Consumer<TicketUpdatedEvent> {
  readonly queueGroup = QUEUE_GROUP_NAME;
  readonly topic = Topics.TicketUpdated;

  async onMessage(
    data: TicketUpdatedEvent["data"],
    message: Message
  ): Promise<void> {
    try {
      const ticket = await Ticket.findById({
        _id: data.id,
        // version: data.version - 1,
      });

      if (!ticket) {
        throw new NotFoundError("Ticket not found");
      }

      await ticket.set("price", data.price).set("title", data.title).save();
      logger.info(`${QUEUE_GROUP_NAME}: Ticket updated`, ticket);

      message.ack();
    } catch (error) {
      logger.error(error, "Error updating ticket");
    }
  }
}
export class TicketDeletedConsumer extends Consumer<TicketDeletedEvent> {
  readonly topic = Topics.TicketDeleted;
  readonly queueGroup = QUEUE_GROUP_NAME;

  async onMessage(data: TicketDeletedEvent["data"], message: Message) {
    try {
      await Ticket.findByIdAndDelete(data.id);
      logger.info(`${QUEUE_GROUP_NAME}: Ticket deleted`, data.id);
      message.ack();
    } catch (error) {
      logger.error(error, "Error deleting ticket");
    }
  }
}

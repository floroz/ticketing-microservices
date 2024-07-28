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
    try {
      // prevent concurrency issues by checking the version
      const nextVersion = 0;

      if (data.version !== 0) {
        logger.error(
          `${QUEUE_GROUP_NAME}: Ticket version mismatch. Expected ${nextVersion} but got ${data.version}`
        );
        throw new Error("Ticket version mismatch");
      }

      logger.info(
        `${QUEUE_GROUP_NAME}: Received TicketCreatedEvent version: ${data.version}`,
        data
      );

      // create new ticket
      const ticket = Ticket.build({
        id: data.id,
        title: data.title,
        price: data.price,
        currency: data.currency,
        version: data.version,
        userId: data.userId,
      });
      await ticket.save({});
      logger.info(`${QUEUE_GROUP_NAME}: Ticket created`, ticket);
      message.ack();
    } catch (error) {
      logger.error(error, "Error creating ticket");
    }
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
      const ticket = await Ticket.findOne({
        _id: data.id,
        // prevent concurrency issues by checking the version
        version: data.version - 1,
      });

      if (!ticket) {
        throw new NotFoundError("Ticket not found");
      }

      logger.info(
        `${QUEUE_GROUP_NAME}: Received TicketUpdatedEvent version: ${data.version} for ticket ${data.id}`,
        ticket
      );

      await ticket
        .set({
          title: data.title,
          price: data.price,
          currency: data.currency,
          version: data.version,
          userId: data.userId,
        })
        .save();
      logger.info(`${QUEUE_GROUP_NAME}: Ticket updated: ${data.id}`);

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

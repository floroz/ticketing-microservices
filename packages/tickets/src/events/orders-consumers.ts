import {
  Consumer,
  OrderCreatedEvent,
  OrderCancelledEvent,
  Topics,
  OrderUpdatedEvent,
  NotFoundError,
} from "floroz-ticketing-common";
import { QUEUE_GROUP_NAME } from "../constants";
import { Message } from "node-nats-streaming";
import { logger } from "../logger";
import { Ticket } from "../models/ticket-model";
import { TicketUpdatedProducer } from "./ticket-producers";
import mongoose from "mongoose";

export class OrderCreatedConsumer extends Consumer<OrderCreatedEvent> {
  readonly queueGroup = QUEUE_GROUP_NAME;
  readonly topic = Topics.OrderCreated;

  async onMessage(data: OrderCreatedEvent["data"], message: Message) {
    const session = await mongoose.startSession();

    try {
      logger.info({ data }, `${this.topic} event received with data`);

      const ticket = await Ticket.findById(data.ticket.id);

      session.startTransaction();

      if (!ticket) {
        throw new NotFoundError();
      }

      // link the order to the ticket - ticket is now reserved
      ticket.set("linkedToOrderId", data.id);

      await ticket.save({ session });

      await new TicketUpdatedProducer(this.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        currency: ticket.currency,
        userId: ticket.userId,
        version: ticket.__v!,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
      });

      await session.commitTransaction();

      message.ack();
    } catch (error) {
      await session.abortTransaction();
      logger.error(`${this.topic} failed.`, error);
    } finally {
      session.endSession();
    }
  }
}

export class OrderCancelledConsumer extends Consumer<OrderCancelledEvent> {
  readonly queueGroup = QUEUE_GROUP_NAME;
  readonly topic = Topics.OrderCancelled;

  async onMessage(data: OrderCancelledEvent["data"], message: Message) {
    const session = await mongoose.startSession();

    session.startTransaction();
    try {
      logger.info(`${this.topic} event received with data`, data);

      const ticket = await Ticket.findById(data.ticket.id);

      if (!ticket) {
        throw new NotFoundError();
      }

      ticket.set("linkedToOrderId", undefined);

      await ticket.save({ session });

      await new TicketUpdatedProducer(this.client).publish({
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        currency: ticket.currency,
        userId: ticket.userId,
        version: ticket.__v!,
        createdAt: ticket.createdAt.toISOString(),
        updatedAt: ticket.updatedAt.toISOString(),
      });

      await session.commitTransaction();

      message.ack();
    } catch (error) {
      await session.abortTransaction();
      logger.error({ error }, `${this.topic} failed.`);
    } finally {
      session.endSession();
    }
  }
}

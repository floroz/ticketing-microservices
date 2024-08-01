import { beforeAll, describe, expect, it, vi } from "vitest";
import {
  TicketCreatedConsumer,
  TicketUpdatedConsumer,
} from "../tickets-consumers";
import {
  OrderExpiredEvent,
  OrderStatus,
  TicketCreatedEvent,
  TicketUpdatedEvent,
} from "floroz-ticketing-common";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket-model";
import { OrderExpiredConsumer } from "../orders-consumers";
import { beforeEach } from "node:test";
import { Order } from "../../models/order-model";

vi.mock("floroz-ticketing-common", async () => ({
  ...(await vi.importActual("floroz-ticketing-common")),
  NATS: {
    connect: vi.fn(),
  },
}));

const cancellationPublisherMock = vi.fn();
vi.mock("../orders-producers.ts", () => ({
  OrderCancelledProducer: vi.fn().mockImplementation(() => ({
    publish: cancellationPublisherMock,
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("TicketCreatedConsumer", () => {
  it("should throw and not acknowledge the message when creating a ticket with a version of 0", async () => {
    const listener = new TicketCreatedConsumer({} as any);

    const data: TicketCreatedEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 20,
      currency: "usd",
      version: 1,
      userId: "123",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const messageMock = {
      ack: vi.fn(),
    };

    await listener.onMessage(data, messageMock as any);

    expect(messageMock.ack).not.toHaveBeenCalled();
  });

  it("should create a copy of the record respecting the version number", async () => {
    const listener = new TicketCreatedConsumer({} as any);

    const data: TicketCreatedEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      title: "concert",
      price: 20,
      currency: "usd",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: "123",
      version: 0,
    };
    const messageMock = {
      ack: vi.fn(),
    };

    let ticket = await Ticket.findById(data.id);
    expect(ticket).toBeNull();

    await listener.onMessage(data, messageMock as any);
    expect(messageMock.ack).toHaveBeenCalledTimes(1);

    ticket = await Ticket.findById(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.title).toBe(data.title);
    expect(ticket!.price).toBe(data.price);
    expect(ticket!.currency).toBe(data.currency);
    expect(ticket!.version).toBe(data.version);
  });
});

describe("TicketUpdatedConsumer", () => {
  it("should throw and not acknowledge the message when updating a ticket with a version mismatch", async () => {
    const ticket = await Ticket.build({
      title: "concert",
      price: 20,
      id: new mongoose.Types.ObjectId().toHexString(),
      currency: "usd",
      version: 4,
      userId: "123",
    }).save();

    const listener = new TicketUpdatedConsumer({} as any);

    const data: TicketUpdatedEvent["data"] = {
      id: ticket.id,
      title: ticket.title,
      currency: ticket.currency,
      userId: ticket.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 8,
      price: 5,
    };

    const messageMock = {
      ack: vi.fn(),
    };

    await listener.onMessage(data, messageMock as any);

    expect(messageMock.ack).not.toHaveBeenCalled();
  });

  it("should update a ticket when version matches", async () => {
    const initialVersion = 4;

    const ticket = Ticket.build({
      title: "concert",
      price: 20,
      id: new mongoose.Types.ObjectId().toHexString(),
      currency: "usd",
      version: initialVersion,
      userId: "123",
    });

    await ticket.save();

    const listener = new TicketUpdatedConsumer({} as any);

    // check if the ticket is created
    expect(await Ticket.findById(ticket.id)).toBeDefined();

    const data: TicketUpdatedEvent["data"] = {
      id: ticket.id,
      title: ticket.title,
      currency: ticket.currency,
      userId: ticket.userId,
      price: 55,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: new Date().toISOString(),
      version: initialVersion + 1,
    };

    const messageMock = {
      ack: vi.fn(),
    };

    await listener.onMessage(data, messageMock as any);

    expect(messageMock.ack).toHaveBeenCalledTimes(1);

    const updated = await Ticket.findById(ticket.id);

    expect(updated?.price).toBe(data.price);
    expect(updated?.version).toBe(data.version);
  });
});

describe("OrderExpiredConsumer", () => {
  it("when no order exists, should acknowledge the message", async () => {
    const orderExpiredConsumer = new OrderExpiredConsumer({} as any);

    const data: OrderExpiredEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
    };

    const messageMock = {
      ack: vi.fn(),
    };

    await orderExpiredConsumer.onMessage(data, messageMock as any);
    expect(messageMock.ack).toHaveBeenCalledTimes(1);
  });

  it("when an order is already cancelled, it should acknowledge the message", async () => {
    const orderExpiredConsumer = new OrderExpiredConsumer({} as any);

    const data: OrderExpiredEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
    };

    const messageMock = {
      ack: vi.fn(),
    };

    const ticket = Ticket.build({
      title: "concert",
      price: 20,
      id: new mongoose.Types.ObjectId().toHexString(),
      currency: "usd",
      version: 4,
      userId: "123",
    });
    await ticket.save();

    const order = Order.build({
      status: OrderStatus.Cancelled,
      userId: "123",
      expiresAt: new Date(),
      ticket,
    });
    await order.save();
    await orderExpiredConsumer.onMessage(data, messageMock as any);
    expect(messageMock.ack).toHaveBeenCalledTimes(1);
  });

  it("when an order is already completed, it should acknowledge the message", async () => {
    const orderExpiredConsumer = new OrderExpiredConsumer({} as any);

    const messageMock = {
      ack: vi.fn(),
    };

    const ticket = Ticket.build({
      title: "concert",
      price: 20,
      id: new mongoose.Types.ObjectId().toHexString(),
      currency: "usd",
      version: 4,
      userId: "123",
    });
    await ticket.save();

    const order = Order.build({
      status: OrderStatus.Complete,
      userId: "123",
      expiresAt: new Date(),
      ticket,
    });
    await order.save();

    const data: OrderExpiredEvent["data"] = {
      id: order.id,
    };

    await orderExpiredConsumer.onMessage(data, messageMock as any);
    expect(messageMock.ack).toHaveBeenCalledTimes(1);
  });

  it("should revert the transaction when there is an issue in publishing the cancellation update", async () => {
    const orderExpiredConsumer = new OrderExpiredConsumer({} as any);

    const messageMock = {
      ack: vi.fn(),
    };

    const ticket = Ticket.build({
      title: "concert",
      price: 20,
      id: new mongoose.Types.ObjectId().toHexString(),
      currency: "usd",
      version: 4,
      userId: "123",
    });
    await ticket.save();

    const order = Order.build({
      status: OrderStatus.Created,
      userId: "123",
      expiresAt: new Date(),
      ticket,
    });
    await order.save();

    const data: OrderExpiredEvent["data"] = {
      id: order.id,
    };

    cancellationPublisherMock.mockRejectedValueOnce(new Error());

    await orderExpiredConsumer.onMessage(data, messageMock as any);

    expect(messageMock.ack).not.toHaveBeenCalled();

    const orderFromDb = await Order.findById(order.id);
    expect(orderFromDb?.status).toEqual(OrderStatus.Created);
  });

  it("should acknowledge the message and update the order status to cancelled", async () => {
    const orderExpiredConsumer = new OrderExpiredConsumer({} as any);

    const messageMock = {
      ack: vi.fn(),
    };

    const ticket = Ticket.build({
      title: "concert",
      price: 20,
      id: new mongoose.Types.ObjectId().toHexString(),
      currency: "usd",
      version: 4,
      userId: "123",
    });
    await ticket.save();

    const order = Order.build({
      status: OrderStatus.Created,
      userId: "123",
      expiresAt: new Date(),
      ticket,
    });
    await order.save();

    const data: OrderExpiredEvent["data"] = {
      id: order.id,
    };

    await orderExpiredConsumer.onMessage(data, messageMock as any);

    expect(messageMock.ack).toHaveBeenCalledTimes(1);
    const updatedOrder = await Order.findById(order.id);
    expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
  });
});

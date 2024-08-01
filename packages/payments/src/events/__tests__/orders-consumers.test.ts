import {
  OrderCancelledEvent,
  OrderCreatedEvent,
  OrderStatus,
} from "floroz-ticketing-common";
import { Message } from "node-nats-streaming";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  OrderCancelledEventConsumer,
  OrderCreatedEventConsumer,
} from "../orders-consumers";
import { Order } from "../../models/order-model";
import mongoose from "mongoose";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("OrderCreatedEventConsumer", () => {
  it("should create a new order", async () => {
    const data: OrderCreatedEvent["data"] = {
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: "123",
      status: OrderStatus.Created,
      expiresAt: new Date().toISOString(),
      ticket: {
        id: new mongoose.Types.ObjectId().toHexString(),
        currency: "usd",
        price: 20,
      },
      version: 0,
    };

    let order = await Order.findById(data.id);
    expect(order).not.toBeTruthy();

    const msg: Message = {
      ack: vi.fn(),
    } as any;

    const consumer = new OrderCreatedEventConsumer({} as any);
    await consumer.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);

    order = await Order.findById(data.id);
    expect(order).toBeTruthy();
    expect(order?.status).toEqual(OrderStatus.Created);
  });
});

describe("OrderCancelledEventConsumer", () => {
  it("should update the order status to cancelled", async () => {
    // create a pre-existing order in the db
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: "123",
      status: OrderStatus.Created,
      version: 0,
      tickets: [
        {
          id: new mongoose.Types.ObjectId().toHexString(),
          price: 20,
          currency: "usd",
        },
      ],
    });

    await order.save();

    const data: OrderCancelledEvent["data"] = {
      id: order.id,
      userId: order.userId,
      status: OrderStatus.Cancelled,
      ticket: {
        id: order.tickets[0].id,
        currency: order.tickets[0].currency,
        price: order.tickets[0].price,
      },
      expiresAt: new Date().toISOString(),
    };

    const msg: Message = {
      ack: vi.fn(),
    } as any;

    const consumer = new OrderCancelledEventConsumer({} as any);

    await consumer.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
  });

  it("should not update the order status if order is already paid", async () => {
    // create a pre-existing order in the db
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: "123",
      status: OrderStatus.Complete,
      version: 0,
      tickets: [
        {
          id: new mongoose.Types.ObjectId().toHexString(),
          price: 20,
          currency: "usd",
        },
      ],
    });

    await order.save();

    const data: OrderCancelledEvent["data"] = {
      id: order.id,
      userId: order.userId,
      status: OrderStatus.Cancelled,
      ticket: {
        id: order.tickets[0].id,
        currency: order.tickets[0].currency,
        price: order.tickets[0].price,
      },
      expiresAt: new Date().toISOString(),
    };

    const msg: Message = {
      ack: vi.fn(),
    } as any;

    const consumer = new OrderCancelledEventConsumer({} as any);

    await consumer.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
    const updated = await Order.findById(order.id);
    expect(updated?.status).toBe(OrderStatus.Complete);
  });

  it("should not update the order status if the order is already cancelled", async () => {
    // create a pre-existing order in the db
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: "123",
      status: OrderStatus.Cancelled,
      version: 0,
      tickets: [
        {
          id: new mongoose.Types.ObjectId().toHexString(),
          price: 20,
          currency: "usd",
        },
      ],
    });

    await order.save();

    const data: OrderCancelledEvent["data"] = {
      id: order.id,
      userId: order.userId,
      status: OrderStatus.Cancelled,
      ticket: {
        id: order.tickets[0].id,
        currency: order.tickets[0].currency,
        price: order.tickets[0].price,
      },
      expiresAt: new Date().toISOString(),
    };

    const msg: Message = {
      ack: vi.fn(),
    } as any;

    const consumer = new OrderCancelledEventConsumer({} as any);

    await consumer.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalledTimes(1);
    const updated = await Order.findById(order.id);
    expect(updated?.status).toBe(OrderStatus.Cancelled);
  });
});

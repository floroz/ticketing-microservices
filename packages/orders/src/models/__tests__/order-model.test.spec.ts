import { OrderStatus } from "floroz-ticketing-common";
import { Order } from "../order-model";
import { it, expect } from "vitest";
import { Ticket } from "../ticket-model";
import mongoose from "mongoose";

it("implements optimistic concurrency control", async () => {
  const order = await Order.build({
    userId: "1234",
    status: OrderStatus.Created,
    ticket: Ticket.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 5,
      title: "concert",
      price: 20,
      currency: "usd",
      userId: "123",
    }),
    expiresAt: new Date(),
  }).save();

  expect(order!.__v).toBe(0);

  order.status = OrderStatus.AwaitingPayment;
  await order.save();
  expect(order!.__v).toBe(1);

  order.status = OrderStatus.Complete;
  await order.save();
  expect(order!.__v).toBe(2);

  const firstInstance = await Order.findById(order.id);
  const secondInstance = await Order.findById(order.id);

  firstInstance!.status = OrderStatus.Cancelled;
  secondInstance!.status = OrderStatus.AwaitingPayment;

  await firstInstance!.save();
  // the second instance should have an outdated version and should throw an error based on mongoose versioning
  await expect(secondInstance!.save()).rejects.toThrow();
});

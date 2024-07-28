import { Ticket } from "../ticket";
import { it, expect } from "vitest";

it("implements optimistic concurrency control", async () => {
  const ticket_v1 = await Ticket.build({
    userId: "1234",
    title: "test",
    price: 10,
    currency: "USD",
  }).save();

  expect(ticket_v1!.__v).toBe(0);

  ticket_v1.price = 15;
  await ticket_v1.save();
  expect(ticket_v1!.__v).toBe(1);

  ticket_v1.title = "new title";
  await ticket_v1.save();
  expect(ticket_v1!.__v).toBe(2);

  const firstInstance = await Ticket.findById(ticket_v1.id);
  const secondInstance = await Ticket.findById(ticket_v1.id);

  firstInstance!.price = 10;
  secondInstance!.price = 20;

  await firstInstance!.save();
  // the second instance should have an outdated version and should throw an error based on mongoose versioning
  await expect(secondInstance!.save()).rejects.toThrow();
});

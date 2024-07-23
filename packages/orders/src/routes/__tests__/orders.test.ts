import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/order";
import { OrderStatus } from "floroz-ticketing-common";

describe("orders", () => {
  it("should return 401 if the user is not authenticated", async () => {
    await request(app).get("/api/orders").expect(401);
  });

  it("should return 400 if the ticketId is not provided", async () => {
    await request(app)
      .post("/api/orders")
      .set("Cookie", global.__get_cookie())
      .send({})
      .expect(400);
  });

  it("should return 400 if the ticketId is an empty string", async () => {
    await request(app)
      .post("/api/orders")
      .set("Cookie", global.__get_cookie())
      .send({
        ticketId: "",
      })
      .expect(400);
  });

  it("should return 400 if the ticketId is not a valid Mongo ID", async () => {
    await request(app)
      .post("/api/orders")
      .set("Cookie", global.__get_cookie())
      .send({
        ticketId: "not-a-valid-id",
      })
      .expect(400);
  });

  it("should return 404 if the ticket does not exist", async () => {
    await request(app)
      .post("/api/orders")
      .set("Cookie", global.__get_cookie())
      .send({
        ticketId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(404);
  });

  it("should return 400 if the ticket is already reserved", async () => {
    const ticket = await Ticket.create({
      title: "Concert",
      price: 20,
      currency: "USD",
      version: 0,
    });

    await Order.create({
      ticket,
      userId: "123",
      status: OrderStatus.Created,
      expiresAt: new Date(),
    });

    const response = await request(app)
      .post("/api/orders")
      .set("Cookie", global.__get_cookie())
      .send({
        ticketId: ticket.id,
      })
      .expect(400);

    expect(response.body.errors[0].message).toEqual(
      "Ticket is already reserved."
    );
  });

  it("should return 201 when creating a new ticket", async () => {
    const ticket = await Ticket.create({
      title: "Concert",
      price: 20,
      currency: "USD",
      version: 0,
    });

    await request(app)
      .post("/api/orders")
      .set("Cookie", global.__get_cookie())
      .send({
        ticketId: ticket.id,
      })
      .expect(201);
  });
});

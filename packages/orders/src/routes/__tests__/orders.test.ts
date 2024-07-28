import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";
import { Order } from "../../models/order";
import { OrderStatus } from "floroz-ticketing-common";

vi.mock("floroz-ticketing-common", async () => ({
  ...(await vi.importActual("floroz-ticketing-common")),
  NATS: {
    connect: vi.fn(),
  },
}));

const orderCreatePublish = vi.fn();
const orderCancelledPublish = vi.fn();

vi.mock("../../events/order-producers", () => ({
  OrderCreatedProducer: vi.fn().mockImplementation(() => ({
    publish: orderCreatePublish,
  })),
  OrderCancelledProducer: vi.fn().mockImplementation(() => ({
    publish: orderCancelledPublish,
  })),
}));

describe("POST /orders", () => {
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
    // create a ticket
    const ticket = await Ticket.create({
      title: "Concert",
      price: 20,
      currency: "USD",
      userId: "123",
      version: 0,
    });

    // create an order
    await Order.create({
      // link ticket so that it is reserved
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
      userId: "123",
    });

    const response = await request(app)
      .post("/api/orders")
      .set("Cookie", global.__get_cookie())
      .send({
        ticketId: ticket.id,
      })
      .expect(201);

    expect(response.body.ticket.id).toEqual(ticket.id);
    expect(orderCreatePublish).toHaveBeenCalledTimes(1);
  });

  it("should abort the db transaction when there is an issue in publishing", async () => {
    const ticket = await Ticket.create({
      title: "Concert",
      price: 20,
      currency: "USD",
      version: 0,
      userId: "123",
    });

    orderCreatePublish.mockRejectedValueOnce(new Error("BOOM!"));

    await request(app)
      .post("/api/orders")
      .set("Cookie", global.__get_cookie())
      .send({
        ticketId: ticket.id,
      })
      .expect(500);
  });
});

describe("GET /orders", () => {
  it("should return 401 if the user is not authenticated", async () => {
    await request(app).get("/api/orders").expect(401);
  });

  it("should return 200 when fetching orders", async () => {
    const ticket = await Ticket.create({
      title: "Concert",
      price: 20,
      currency: "USD",
      version: 0,
      userId: "123",
    });

    const postResponse = await request(app)
      .post("/api/orders")
      .set("Cookie", global.__get_cookie())
      .send({
        ticketId: ticket.id,
      })
      .expect(201);

    const response = await request(app)
      .get("/api/orders")
      .set("Cookie", global.__get_cookie())
      .expect(200);

    expect(response.body.length).toEqual(1);
    expect(response.body[0].ticket.id).toEqual(postResponse.body.ticket.id);
  });
});

describe("GET /orders/:id", () => {
  it("should return 401 if the user is not authenticated", async () => {
    await request(app).get("/api/orders/123").expect(401);
  });

  it("should return 404 if the order does not exist", async () => {
    await request(app)
      .get(`/api/orders/${new mongoose.Types.ObjectId().toHexString()}`)
      .set("Cookie", global.__get_cookie())
      .expect(404);
  });

  it("should return 401 when trying accessing the order of another user", async () => {
    const user1 = global.__get_cookie({ randomize: true });
    const user2 = global.__get_cookie({ randomize: true });

    const ticket = await Ticket.create({
      title: "Concert",
      price: 20,
      currency: "USD",
      version: 0,
      userId: "123",
    });

    const postResponse = await request(app)
      .post("/api/orders")
      .set("Cookie", user1)
      .send({
        ticketId: ticket.id,
      })
      .expect(201);

    await request(app)
      .get(`/api/orders/${postResponse.body.id}`)
      .set("Cookie", user2)
      .expect(401);
  });

  it("should return 200 if the order exists", async () => {
    const ticket = await Ticket.create({
      title: "Concert",
      price: 20,
      currency: "USD",
      version: 0,
      userId: "123",
    });

    const postResponse = await request(app)
      .post("/api/orders")
      .set("Cookie", global.__get_cookie())
      .send({
        ticketId: ticket.id,
      })
      .expect(201);

    const response = await request(app)
      .get(`/api/orders/${postResponse.body.id}`)
      .set("Cookie", global.__get_cookie())
      .expect(200);

    expect(response.body.ticket.id).toEqual(postResponse.body.ticket.id);
  });
});

describe("PATCH /orders/:id", () => {
  it("should return 401 if the user is not authenticated", async () => {
    await request(app).patch("/api/orders/123").expect(401);
  });

  it("should return 404 if the order does not exist", async () => {
    await request(app)
      .patch(`/api/orders/${new mongoose.Types.ObjectId().toHexString()}`)
      .send({
        status: OrderStatus.Cancelled,
      })
      .set("Cookie", global.__get_cookie())
      .expect(404);
  });

  it("should return 401 when trying deleting the order of another user", async () => {
    const user1 = global.__get_cookie({ randomize: true });
    const user2 = global.__get_cookie({ randomize: true });

    const ticket = await Ticket.create({
      title: "Concert",
      price: 20,
      currency: "USD",
      version: 0,
      userId: "123",
    });

    const postResponse = await request(app)
      .post("/api/orders")
      .set("Cookie", user1)
      .send({
        ticketId: ticket.id,
      })
      .expect(201);

    await request(app)
      .patch(`/api/orders/${postResponse.body.id}`)
      .set("Cookie", user2)
      .send({
        status: OrderStatus.Cancelled,
      })
      .expect(401);
  });

  it("should return 200 if the order exists and update the status", async () => {
    const ticket = await Ticket.create({
      title: "Concert",
      price: 20,
      currency: "USD",
      version: 0,
      userId: "123",
    });

    const postResponse = await request(app)
      .post("/api/orders")
      .set("Cookie", global.__get_cookie())
      .send({
        ticketId: ticket.id,
      })
      .expect(201);

    const patchResponse = await request(app)
      .patch(`/api/orders/${postResponse.body.id}`)
      .set("Cookie", global.__get_cookie())
      .send({
        status: OrderStatus.Cancelled,
      })
      .expect(200);

    expect(patchResponse.body.status).toEqual(OrderStatus.Cancelled);
    expect(patchResponse.body.ticket.id).toEqual(ticket.id);
    expect(orderCancelledPublish).toHaveBeenCalledTimes(1);
  });

  it("should abort the db transaction when there is an issue in publishing", async () => {
    const ticket = await Ticket.create({
      title: "Concert",
      price: 20,
      currency: "USD",
      version: 0,
      userId: "123",
    });

    const postResponse = await request(app)
      .post("/api/orders")
      .set("Cookie", global.__get_cookie())
      .send({
        ticketId: ticket.id,
      })
      .expect(201);

    orderCancelledPublish.mockRejectedValueOnce(new Error("Error publishing"));

    await request(app)
      .patch(`/api/orders/${postResponse.body.id}`)
      .set("Cookie", global.__get_cookie())
      .send({
        status: OrderStatus.Cancelled,
      })
      .expect(500);

    const order = await Order.findById(postResponse.body.id);

    expect(order?.status).not.toEqual(OrderStatus.Cancelled);
  });
});

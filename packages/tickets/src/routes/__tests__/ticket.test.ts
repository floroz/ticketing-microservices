import request from "supertest";
import { app } from "../../app";
import { it, expect, vi, beforeEach, afterAll } from "vitest";
import mongoose from "mongoose";
import { Ticket } from "../../models/ticket";

vi.mock("floroz-ticketing-common", async () => ({
  ...(await vi.importActual("floroz-ticketing-common")),
  NATS: {
    connect: vi.fn(),
  },
}));

const ticketCreatePublish = vi.fn();
const ticketUpdatePublish = vi.fn();
const ticketDeletePublish = vi.fn();

vi.mock("../../events/producers", () => ({
  TicketCreatedProducer: vi.fn().mockImplementation(() => ({
    publish: ticketCreatePublish,
  })),
  TicketUpdatedProducer: vi.fn().mockImplementation(() => ({
    publish: ticketUpdatePublish,
  })),
  TicketDeletedProducer: vi.fn().mockImplementation(() => ({
    publish: ticketDeletePublish,
  })),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  vi.resetAllMocks();
});

it("returns 200 for GET /api/tickets", async () => {
  const ticket1 = {
    title: "new-ticket-1",
    price: 12,
    currency: "USD",
    userId: "12345",
  };

  const ticket2 = {
    title: "new-ticket-2",
    price: 12,
    currency: "USD",
    userId: "12345",
  };

  // create 2 tickets
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.__get_cookie())
    .send(ticket1)
    .expect(201);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.__get_cookie())
    .send(ticket2)
    .expect(201);

  // get all tickets
  const response = await request(app).get("/api/tickets").expect(200);

  expect(ticketCreatePublish).toHaveBeenCalledTimes(2);

  expect(response.body.tickets).toHaveLength(2);
  expect(response.body.tickets[0].title).toBe(ticket1.title);
  expect(response.body.tickets[1].title).toBe(ticket2.title);
});

it("returns 200 and an empty collection for GET /api/tickets - when empty", async () => {
  const res = await request(app).get("/api/tickets").expect(200);

  expect(res.body.tickets).toEqual([]);
});

it("returns 200 for GET /api/tickets/:id", async () => {
  const ticket = {
    title: "new-ticket",
    price: 12,
    currency: "USD",
    userId: "12345",
  };

  const postResponse = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.__get_cookie())
    .send(ticket)
    .expect(201);

  const response = await request(app)
    .get("/api/tickets/" + postResponse.body.id)
    .set("Cookie", global.__get_cookie())
    .expect(200);

  expect(response.body.title).toBe(ticket.title);
});

it("returns 404 for GET /api/tickets/:id - when ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .get("/api/tickets/" + id)
    .set("Cookie", global.__get_cookie())
    .expect(404);
});

it("returns 401 for POST /api/tickets - when unauthorized", async () => {
  await request(app).post("/api/tickets").expect(401);
});

it("returns 400 for POST /api/tickets - when title is required", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.__get_cookie())
    .send({
      price: 10,
    })
    .expect(400);
});

it("returns 400 for POST /api/tickets - when price is required", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.__get_cookie())
    .send({
      title: "test",
    })
    .expect(400);
});

it("returns 400 for POST /api/tickets - when price is smaller than 0", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.__get_cookie())
    .send({
      title: "test",
      price: -10,
    })
    .expect(400);
});

it("returns 201 for POST /api/tickets - creates a new ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.__get_cookie())
    .send({
      userId: "1234",
      title: "test",
      price: 10,
      currency: "USD",
    })
    .expect(201);
  expect(response.body.title).toBe("test");
  expect(response.body.price).toBe(10);
  expect(response.body.id).toBeDefined();
  expect(response.body.createdAt).toBeDefined();
  expect(response.body.updatedAt).toBeDefined();

  expect(ticketCreatePublish).toHaveBeenCalledTimes(1);
});

it("should revert the transaction of creating a new ticket if an error occurs with publishing", async () => {
  const ticket = {
    userId: "1234",
    title: "a new ticket",
    price: 10,
    currency: "USD",
  };

  ticketCreatePublish.mockRejectedValueOnce(new Error("boom"));

  await request(app)
    .post("/api/tickets")
    .set("Cookie", global.__get_cookie())
    .send(ticket)
    .expect(500);

  // the record should not exist in the db
  await expect(Ticket.findOne({ title: ticket.title })).resolves.toBeNull();
});

it("returns 200 for PUT /api/tickets/:id - when ticket is found", async () => {
  // create  ticket to update
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.__get_cookie())
    .send({
      userId: "1234",
      title: "test",
      price: 10,
      currency: "USD",
    })
    .expect(201);
  const response = await request(app)
    .put("/api/tickets/" + res.body.id)
    .set("Cookie", global.__get_cookie())
    .send({
      userId: "1234",
      title: "test",
      price: 15,
      currency: "USD",
    })
    .expect(200);

  expect(response.body.title).toBe("test");
  expect(response.body.price).toBe(15);
  expect(response.body.id).toBe(res.body.id);
  expect(response.body.createdAt).toBeDefined();
  expect(response.body.updatedAt).toBeDefined();

  expect(ticketUpdatePublish).toHaveBeenCalledTimes(1);
});

it("returns 400 for PUT /api/tickets/:id - when title is required", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put("/api/tickets/" + id)
    .set("Cookie", global.__get_cookie())
    .send({
      price: 10,
    })
    .expect(400);
});

it("returns 401 for PUT /api/tickets/:id - when unauthorized", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put("/api/tickets/" + id)
    .expect(401);
});

it("returns 403 for PUT /api/tickets/:id - when user is not allowed to update", async () => {
  const ticket = {
    userId: "1234",
    title: "test",
    price: 15,
    currency: "USD",
  };

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.__get_cookie({ randomize: true }))
    .send(ticket)
    .expect(201);

  await request(app)
    .put("/api/tickets/" + res.body.id)
    .set("Cookie", global.__get_cookie({ randomize: true }))
    .send({
      userId: "1234",
      title: "test",
      price: 15,
      currency: "USD",
    })
    .expect(403);
});

it("returns 404 for PUT /api/tickets/:id - when ticket is not found", async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .put(`/api/tickets/${ticketId}`)
    .set("Cookie", global.__get_cookie())
    .send({
      userId: "1234",
      title: "test",
      price: 10,
      currency: "USD",
    });
  expect(response.status).toBe(404);
});

it("should revert the transaction of updating a ticket if an error occurs with publishing", async () => {
  const ticket = {
    userId: "1234",
    title: "a new ticket",
    price: 10,
    currency: "USD",
  };

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.__get_cookie())
    .send(ticket)
    .expect(201);

  const id = res.body.id;

  const update = {
    userId: "1234",
    title: "test",
    price: 15,
    currency: "USD",
  };

  ticketUpdatePublish.mockRejectedValueOnce(new Error("boom"));

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.__get_cookie())
    .send(update)
    .expect(500);

  const savedTicket = await Ticket.findById(id);

  // the update should have not gone through
  expect(savedTicket?.title).toBe(ticket.title);
  expect(savedTicket?.price).toBe(ticket.price);
});

it("returns 204 for DELETE /api/tickets/:id - when ticket is found", async () => {
  const ticket = {
    userId: "1234",
    title: "test",
    price: 10,
    currency: "USD",
  };

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.__get_cookie())
    .send(ticket)
    .expect(201);

  await request(app)
    .delete("/api/tickets/" + res.body.id)
    .set("Cookie", global.__get_cookie())
    .expect(204);

  expect(ticketDeletePublish).toHaveBeenCalledTimes(1);
});

it("returns 404 for DELETE /api/tickets/:id - when ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .delete("/api/tickets/" + id)
    .set("Cookie", global.__get_cookie())
    .expect(404);
});

it("should revert the transaction of deleting a ticket if an error occurs with publishing", async () => {
  const ticket = {
    userId: "1234",
    title: "a new ticket",
    price: 10,
    currency: "USD",
  };

  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.__get_cookie())
    .send(ticket)
    .expect(201);

  ticketDeletePublish.mockRejectedValueOnce(new Error("boom"));
  await request(app)
    .delete("/api/tickets/" + res.body.id)
    .set("Cookie", global.__get_cookie())
    .expect(500);

  const savedTicket = await Ticket.findById(res.body.id);
  expect(savedTicket).not.toBeNull();
});

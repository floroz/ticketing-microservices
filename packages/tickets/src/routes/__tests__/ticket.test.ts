import request from "supertest";
import { app } from "../../app";
import { it, expect } from "vitest";
import mongoose from "mongoose";

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

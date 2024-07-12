import request from "supertest";
import { app } from "../../app";
import { it, expect } from "vitest";
import mongoose from "mongoose";

// it("returns 200 for GET /api/tickets", async () => {
//   const cookie = global.__auth_signin();

//   const ticket = {
//     title: "new-ticket",
//     price: 12,
//     currency: "USD",
//     userId: "12345",
//   };

//   const postResponse = await request(app)
//     .post("/api/tickets")
//     .set("Cookie", cookie)
//     .send(ticket)
//     .expect(201);

//   const response = await request(app)
//     .get("/api/tickets")
//     .set("Cookie", cookie)
//     .expect(200);

//   expect(response.body.title).toBe(ticket.title);
// });

it("returns 200 for GET /api/tickets/:id", async () => {
  const cookie = global.__auth_signin();

  const ticket = {
    title: "new-ticket",
    price: 12,
    currency: "USD",
    userId: "12345",
  };

  const postResponse = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send(ticket)
    .expect(201);

  const response = await request(app)
    .get("/api/tickets/" + postResponse.body.id)
    .set("Cookie", cookie)
    .expect(200);

  expect(response.body.title).toBe(ticket.title);
});

it("returns 404 for GET /api/tickets/:id - when ticket is not found", async () => {
  await request(app).get("/api/tickets/1").expect(404);
});

it("returns 401 for POST /api/tickets - when unauthorized", async () => {
  await request(app).post("/api/tickets").expect(401);
});

it("returns 401 for PUT /api/tickets/:id - when unauthorized", async () => {
  await request(app).put("/api/tickets/1").expect(401);
});

it("returns 400 for POST /api/tickets - when title is required", async () => {
  const cookie = global.__auth_signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      price: 10,
    })
    .expect(400);
});

it("returns 400 for POST /api/tickets - when price is required", async () => {
  const cookie = global.__auth_signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "test",
    })
    .expect(400);
});

it("returns 400 for POST /api/tickets - when price is smaller than 0", async () => {
  const cookie = global.__auth_signin();
  await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "test",
      price: -10,
    })
    .expect(400);
});

it("returns 201 for POST /api/tickets - creates a new ticket", async () => {
  const cookie = global.__auth_signin();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
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
  const cookie = global.__auth_signin();
  // create  ticket to update
  const res = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      userId: "1234",
      title: "test",
      price: 10,
      currency: "USD",
    })
    .expect(201);
  const response = await request(app)
    .put("/api/tickets/" + res.body.id)
    .set("Cookie", cookie)
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

it("returns 404 for PUT /api/tickets/:id - when ticket is not found", async () => {
  const cookie = global.__auth_signin();
  const fakeId = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .put(`/api/tickets/${fakeId}`)
    .set("Cookie", cookie)
    .send({
      userId: "1234",
      title: "test",
      price: 10,
      currency: "USD",
    });
  expect(response.status).toBe(404);
});

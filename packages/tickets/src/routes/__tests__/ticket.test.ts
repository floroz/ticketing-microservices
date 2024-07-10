import request from "supertest";
import { app } from "../../app";
import { it, expect } from "vitest";

it("returns 200 for GET /api/tickets", async () => {
  const response = await request(app).get("/api/tickets").expect(200);
  expect(response.body.message).toBe("Hello, ticket!");
});

it("returns 200 for GET /api/tickets/:id", async () => {
  const response = await request(app).get("/api/tickets/1").expect(200);
  expect(response.body.message).toBe("Hello, 1");
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
  const response = await request(app)
    .put("/api/tickets/1")
    .set("Cookie", cookie)
    .send({
      userId: "1234",
      title: "test",
      price: 10,
      currency: "USD",
    })
    .expect(200);

  expect(response.body.title).toBe("test");
  expect(response.body.price).toBe(10);
  expect(response.body.id).toBe("1");
  expect(response.body.createdAt).toBeDefined();
  expect(response.body.updatedAt).toBeDefined();
});

it("returns 201 for PUT /api/tickets/:id - when ticket is not found", async () => {
  const cookie = global.__auth_signin();
  const response = await request(app)
    .put("/api/tickets/1")
    .set("Cookie", cookie)
    .send({
      userId: "1234",
      title: "test",
      price: 10,
      currency: "USD",
    })
    .expect(200);

  expect(response.body.title).toBe("test");
  expect(response.body.price).toBe(10);
  expect(response.body.id).toBe("1");
  expect(response.body.createdAt).toBeDefined();
  expect(response.body.updatedAt).toBeDefined();
});

it.skip("returns 404 for GET /api/tickets/:id - when ticket is not found", async () => {
  await request(app).get("/api/tickets/1").expect(404);
});

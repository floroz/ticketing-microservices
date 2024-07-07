import supertest from "supertest";
import { app } from "../src/app";
import { it, expect } from "vitest";

it("returns 200 for GET /api/tickets", async () => {
  const response = await supertest(app).get("/api/tickets");
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Hello, ticket!");
});

it("returns 200 for GET /api/tickets/:id", async () => {
  const response = await supertest(app).get("/api/tickets/1");
  expect(response.status).toBe(200);
  expect(response.body.message).toBe("Hello, 1");
});

it.only("returns 401 for POST /api/tickets - when unauthorized", async () => {
  const response = await supertest(app).post("/api/tickets");
  expect(response.status).toBe(401);
});

it.skip("returns 401 for PUT /api/tickets/:id - when unauthorized", async () => {
  const response = await supertest(app).put("/api/tickets/1");
  expect(response.status).toBe(401);
});

it.skip("returns 201 for POST /api/tickets", async () => {
  const response = await supertest(app)
    .post("/api/tickets")
    .set("Authorization", "Bearer 123");
  expect(response.status).toBe(201);
});

it.skip("returns 200 for PUT /api/tickets/:id", async () => {
  const response = await supertest(app).put("/api/tickets/1");
  expect(response.status).toBe(200);
});

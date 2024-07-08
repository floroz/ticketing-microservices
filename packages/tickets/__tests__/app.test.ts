import request from "supertest";
import { app } from "../src/app";
import { it, expect } from "vitest";

const email = "test@test.com";
const password = "password";

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

it("returns 201 for POST /api/tickets", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", "1234")
    .send({})
    .expect(201);
});

it("returns 200 for PUT /api/tickets/:id", async () => {
  const signup = await request(app)
    .post("/api/users/signup")
    .send({
      email,
      password,
    })
    .expect(201);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", signup.get("Set-Cookie"))
    .send({})
    .expect(201);
});

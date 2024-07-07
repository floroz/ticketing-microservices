import supertest from "supertest";
import { app } from "../src/app";
import { it, expect } from "vitest";

it("returns 404 if the route does not exist", async () => {
  const response = await supertest(app).get("/api/tickets");
  expect(response.status).toBe(404);
});

it("returns 401 if the user is not authenticated", async () => {
  const response = await supertest(app).post("/api/tickets");
  expect(response.status).toBe(401);
});

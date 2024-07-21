import { describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../../app";

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

  it("should return 400 if the ticketId is not a valid Mongo ID", async () => {
    await request(app)
      .post("/api/orders")
      .set("Cookie", global.__get_cookie())
      .send({
        ticketId: "not-a-valid-id",
      })
      .expect(400);
  });
});

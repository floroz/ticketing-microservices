import { it, expect, describe } from "vitest";
import request from "supertest";
import { app } from "../../app";

const ROUTE = "/api/users/current-user";
const email = "test@test.com";
const password = "password";

describe("Current User Route", () => {
  it("should return a 200 on successful request", async () => {
    const signup = await request(app)
      .post("/api/users/signup")
      .send({
        email,
        password,
      })
      .expect(201);

    const response = await request(app)
      .get(ROUTE)
      .set("Cookie", signup.get("Set-Cookie"))
      .send({})
      .expect(200);

    expect(response.body.currentUser.email).toBe(email);
    expect(response.body.currentUser.id).toBeTypeOf("string");
    expect(response.body.currentUser.role).toBe("user");
  });

  it("should return a 200 without response for unauthorized requests", async () => {
    const response = await request(app).get(ROUTE).send({}).expect(200);

    expect(response.body.currentUser).toBe(null);
  });
});

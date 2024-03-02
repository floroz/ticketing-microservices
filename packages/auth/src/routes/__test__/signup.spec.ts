import { it, expect, describe } from "vitest";
import request from "supertest";
import { app } from "../../app";

const ROUTE = "/api/users/signup";
const email = "test@test.com";
const password = "password";

describe("Signup Route", () => {
  it("should return a 201 on successful signup", async () => {
    const response = await request(app)
      .post(ROUTE)
      .send({
        email,
        password,
      })
      .expect(201);

    expect(response.body.email).toBe(email);
    expect(response.body.id).toBeTypeOf("string");
    expect(response.body.role).toBe("user");
    expect(response.body).not.toHaveProperty("password");
  });

  it("should return a 400 with an invalid email", async () => {
    const response = await request(app)
      .post(ROUTE)
      .send({
        email: "invalidemail",
        password: "password",
      })
      .expect(400);

    expect(response.body.errors[0].message).toBe("Email must be valid");
  });

  it("should return a 400 with an invalid password", async () => {
    const response = await request(app)
      .post(ROUTE)
      .send({
        email: "test@test.com",
        password: "pa",
      })
      .expect(400);

    expect(response.body.errors[0].message).toBe(
      "Password must be between 4 and 20 characters"
    );
  });

  it("should return a 400 with missing email and password", async () => {
    const response = await request(app).post(ROUTE).send({}).expect(400);
    expect(response.body.errors[0].message).toBe("Email must be valid");
    expect(response.body.errors[1].message).toBe(
      "Password must be between 4 and 20 characters"
    );
  });

  it("should not allow duplicate emails", async () => {
    // Create a user with the same email
    await request(app)
      .post(ROUTE)
      .send({
        email,
        password,
      })
      .expect(201);

    // Try to create another user with the same email
    const response = await request(app)
      .post(ROUTE)
      .send({
        email,
        password,
      })
      .expect(400);

    expect(response.body.errors[0].message).toMatchInlineSnapshot(
      `"Invalid email or password"`
    );
  });

  it("should set a cookie after successful signup", async () => {
    const response = await request(app)
      .post(ROUTE)
      .send({
        email,
        password,
      })
      .expect(201);

    expect(response.get("Set-Cookie")).toBeDefined();
    expect(response.get("Set-Cookie")[0]).toContain("session=");
  });
});

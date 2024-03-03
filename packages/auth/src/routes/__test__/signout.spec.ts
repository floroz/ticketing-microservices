import { it, expect, describe } from "vitest";
import request from "supertest";
import { app } from "../../app";

const ROUTE = "/api/users/signout";
const email = "test@test.com";
const password = "password";

describe("Signout Route", () => {
  it("should return a 200 on successful logout and invalidate the session", async () => {
    const signupResponse = await request(app)
      .post('/api/users/signup')
      .send({
        email,
        password,
      })
      .expect(201);
    
    expect(signupResponse.get("Set-Cookie")[0]).toContain("session=");
    expect(signupResponse.get("Set-Cookie")[0]).not.toContain("session=;");
    
    const response = await request(app)
      .post(ROUTE)
      .send({})
      .expect(200);
    
    expect(response.get("Set-Cookie")[0]).toContain("session=; path=/;");
  });
});

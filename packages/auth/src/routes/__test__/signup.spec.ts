import { it, expect } from "vitest";
import request from "supertest";
import { app } from "../../app";

it("should return a 201 on successful signup", async () => {
  const email = 'test@test.com';
  const password = 'password';

    return request(app)
      .post("/api/users/signup")
      .send({
        email,
        password,
      })
      .expect(201)
      .expect((response) => {
        expect(response.body.email).toBe(email);
        expect(response.body.id).toBeTypeOf('string');
        expect(response.body.role).toBe("user");
        expect(response.body).not.toHaveProperty('password');
      });
  });

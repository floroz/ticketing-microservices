import { expect, it, describe } from "vitest";
import { JWTService } from "../jwt";

const jwtService = new JWTService('secret');

describe("JWTService", () => {
  it("should generate and verify token", async () => {
    const userPayload = { id: "123", email: "", role: "user" };
    const token = jwtService.generateToken(userPayload as any);

    expect(token).toBeTypeOf("string");
    const payload = jwtService.verify(token);
    expect(payload).toMatchObject(userPayload);
  });

  it("should not verify invalid token", async () => {
    const payload = jwtService.verify("invalidtoken");
    expect(payload).toBe(null);
  });

  it("should decode token", async () => {
    const userPayload = { id: "123", email: "", role: "user" };
    const token = jwtService.generateToken(userPayload as any);

    const decodedPayload = jwtService.decodeToken(token);
    expect(decodedPayload).toMatchObject(userPayload);
  });

  it("should not decode invalid token", async () => {
    const decodedPayload = jwtService.decodeToken("invalidtoken");
    expect(decodedPayload).toBe(null);
  });
});

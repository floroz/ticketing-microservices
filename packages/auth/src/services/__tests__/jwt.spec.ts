import { expect, it, describe } from "vitest";
import { JWTService } from "../jwt";

describe("JWTService", () => {
  it("should generate and verify token", async () => {
    const userPayload = { id: "123", email: "", role: "user" };
    const token = JWTService.generateToken(userPayload as any);

    expect(token).toBeTypeOf("string");
    const payload = JWTService.verify(token);
    expect(payload).toMatchObject(userPayload);
  });

  it("should not verify invalid token", async () => {
    const payload = JWTService.verify("invalidtoken");
    expect(payload).toBe(null);
  });

  it("should decode token", async () => {
    const userPayload = { id: "123", email: "", role: "user" };
    const token = JWTService.generateToken(userPayload as any);

    const decodedPayload = JWTService.decodeToken(token);
    expect(decodedPayload).toMatchObject(userPayload);
  });

  it("should not decode invalid token", async () => {
    const decodedPayload = JWTService.decodeToken("invalidtoken");
    expect(decodedPayload).toBe(null);
  });
});

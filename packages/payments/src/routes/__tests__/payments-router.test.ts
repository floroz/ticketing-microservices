import { expect, it, describe } from "vitest";
import { Order } from "../../models/order-model";
import { OrderStatus } from "floroz-ticketing-common";
import mongoose from "mongoose";
import request from "supertest";
import { app } from "../../app";

describe("POST /payments", () => {
  it("should return 400 for an empty payload", async () => {
    const response = await request(app)
      .post("/api/payments")
      .set("Cookie", global.__get_cookie())
      .send({})
      .expect(400);

    expect(response.body.errors).toMatchInlineSnapshot(`
      [
        {
          "field": "orderId",
          "message": "Invalid value",
        },
        {
          "field": "orderId",
          "message": "orderId must be provided",
        },
        {
          "field": "token",
          "message": "Invalid value",
        },
        {
          "field": "token",
          "message": "Stripe token must be provided",
        },
      ]
    `);
  });

  it("should return 400 when an invalid orderId is provided", async () => {
    const response = await request(app)
      .post("/api/payments")
      .set("Cookie", global.__get_cookie())
      .send({
        token: "tok_visa",
      })
      .expect(400);

    expect(response.body.errors).toMatchInlineSnapshot(`
      [
        {
          "field": "orderId",
          "message": "Invalid value",
        },
        {
          "field": "orderId",
          "message": "orderId must be provided",
        },
      ]
    `);
  });

  it("should return 400 when an invalid token is provided", async () => {
    const response = await request(app)
      .post("/api/payments")
      .set("Cookie", global.__get_cookie())
      .send({
        orderId: new mongoose.Types.ObjectId().toHexString(),
      })
      .expect(400);

    expect(response.body.errors).toMatchInlineSnapshot(`
      [
        {
          "field": "token",
          "message": "Invalid value",
        },
        {
          "field": "token",
          "message": "Stripe token must be provided",
        },
      ]
    `);
  });

  it("should return 404 when an order doesn't exist", async () => {
    const response = await request(app)
      .post("/api/payments")
      .set("Cookie", global.__get_cookie())
      .send({
        orderId: new mongoose.Types.ObjectId().toHexString(),
        token: "1234",
      })
      .expect(404);

    expect(response.body.errors).toMatchInlineSnapshot(`
      [
        {
          "message": "Not found",
        },
      ]
    `);
  });

  it("should return 401 when a request doesn't match the user in the order", async () => {
    // create an order
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: Math.random().toString().slice(2),
      status: OrderStatus.Created,
      tickets: [
        {
          id: new mongoose.Types.ObjectId().toHexString(),
          price: 20,
          currency: "usd",
        },
      ],
      version: 0,
    });

    // save the order
    await order.save();

    // make a request to the payments service
    // expect a 401 status code
    const response = await request(app)
      .post("/api/payments")
      .set("Cookie", global.__get_cookie())
      .send({ orderId: order.id, token: "123" })
      .expect(401);

    expect(response.body.errors).toMatchInlineSnapshot(`
      [
        {
          "message": "Not Authorized",
        },
      ]
    `);
  });

  it("should return 403 when submitting a payment for an order that was already cancelled", async () => {
    // create an order
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: global.__get_user_id(),
      status: OrderStatus.Cancelled,
      tickets: [
        {
          id: new mongoose.Types.ObjectId().toHexString(),
          price: 20,
          currency: "usd",
        },
      ],
      version: 0,
    });

    // save the order
    await order.save();

    // make a request to the payments service
    // expect a 403 status code
    const response = await request(app)
      .post("/api/payments")
      .set("Cookie", global.__get_cookie())
      .send({ orderId: order.id, token: "123" })
      .expect(403);

    expect(response.body.errors).toMatchInlineSnapshot(`
      [
        {
          "message": "Order is already cancelled.",
        },
      ]
    `);
  });

  it("should receive a valid token in the request, and submit a payment to the Stripe API", async () => {
    // create a valid order
    const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      userId: global.__get_user_id(),
      status: OrderStatus.Created,
      tickets: [
        {
          id: new mongoose.Types.ObjectId().toHexString(),
          price: 20,
          currency: "usd",
        },
      ],
      version: 0,
    });

    await order.save();

    // create a valid token
    const token = "tok_visa";

    // make a request to the payments service
    await request(app)
      .post("/api/payments")
      .set("Cookie", global.__get_cookie())
      .send({ orderId: order.id, token })
      .expect(201);

    // create a transaction record in the db
  });
});

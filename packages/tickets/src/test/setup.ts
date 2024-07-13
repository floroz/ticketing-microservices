import { MongoMemoryServer } from "mongodb-memory-server";
import { afterAll, beforeAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

let mongo: MongoMemoryServer | null = null;
declare global {
  var __get_cookie: (opts?: { randomize?: boolean }) => string[];
}

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();
  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  mongo = null;
  await mongoose.connection.close();
});

global.__get_cookie = ({ randomize } = { randomize: false }) => {
  const payload = {
    email: "test@test.com",
    id: "123123",
  };

  if (randomize) {
    const randomEmail = `${Math.random()}@test.com`;
    payload.email = randomEmail;
    payload.id = Math.random().toString(36).substring(7);
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET!);

  const session = { token };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString("base64");

  return [`session=${base64}`];
};

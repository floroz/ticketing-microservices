import jwt from "jsonwebtoken";
import { MongoMemoryReplSet } from "mongodb-memory-server";
import { afterAll, beforeAll, beforeEach } from "vitest";
import mongoose from "mongoose";

let replSet: MongoMemoryReplSet | null = null;

beforeAll(async () => {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri, {});
});

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (replSet) {
    await replSet.stop();
  }
  replSet = null;
  await mongoose.connection.close();
});

declare global {
  var __get_cookie: (opts?: { randomize?: boolean }) => string[];
}

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

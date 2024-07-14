import mongoose from "mongoose";
import { DatabaseConnectionError } from "floroz-ticketing-common";
import { app } from "./app";
import { logger } from "./logger";
import { initNatsClient } from "./nats/client";

const port = 3001;

const main = async () => {
  if (process.env.JWT_SECRET == null) {
    throw new Error("JWT_SECRET must be defined");
  } else {
    logger.info("JWT_Secret loaded.");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  let mongo: typeof mongoose | null = null;
  try {
    mongo = await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error(error);
    throw new DatabaseConnectionError();
  }

  try {
    const client = await initNatsClient();
    console.log("NATS client connected");

    client.on("close", () => {
      logger.info("NATS connection closed");
      process.exit(0);
    });

    process.on("SIGINT", () => {
      client.close();
    });

    process.on("SIGTERM", () => {
      client.close();
    });
  } catch (error) {
    logger.error(error);
  }

  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });

  process.on("beforeExit", async () => {
    if (mongo) {
      await mongo.disconnect();
      logger.info("Disconnected from MongoDB");
      await mongoose.connection.close();
    }
  });
};

main();

import mongoose from "mongoose";
import { logger } from "../logger";
import { DatabaseConnectionError } from "floroz-ticketing-common";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  let mongo: typeof mongoose | null = null;
  try {
    mongo = await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error(error);
    throw new DatabaseConnectionError();
  }

  process.on("beforeExit", async () => {
    if (mongo) {
      await mongo.disconnect();
      logger.info("Disconnected from MongoDB");
      await mongoose.connection.close();
    }
  });
};

export { connectDB };

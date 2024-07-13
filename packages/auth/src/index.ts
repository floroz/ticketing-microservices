import mongoose from "mongoose";
import { DatabaseConnectionError } from "floroz-ticketing-common";

import { app } from "./app";
import { logger } from "./logger";

const port = 3000;

if (process.env.JWT_SECRET == null) {
  throw new Error("JWT_SECRET must be defined");
} else {
  logger.info("jwt secret loaded.");
}

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error(error);
    throw new DatabaseConnectionError();
  }
};

app.listen(port, async () => {
  logger.info(`Server is running on port ${port}`);
});

connectDB();

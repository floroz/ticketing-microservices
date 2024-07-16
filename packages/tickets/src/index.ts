import { app } from "./app";
import { logger } from "./logger";
import { NATS } from "floroz-ticketing-common";
import { connectDB } from "./db/connect";

const PORT = 3001;
const clientId = process.env.NATS_CLIENT_ID || "tickets";
const clusterId = process.env.NATS_CLUSTER_ID || "ticketing";
const url = process.env.NATS_URL || "http://nats-srv.default:4222";

const main = async () => {
  if (process.env.JWT_SECRET == null) {
    throw new Error("JWT_SECRET must be defined");
  } else {
    logger.info("JWT_Secret loaded.");
  }

  await connectDB();

  try {
    await NATS.connect(clusterId, clientId, url);
    logger.info("NATS client connected");
  } catch (error) {
    logger.error("Error in connecting to NATS.", error);
    throw error;
  }

  NATS.client.on("close", () => {
    logger.info("NATS connection closed");
    process.exit(0);
  });

  NATS.client.on("close", () => {
    logger.info("NATS connection closed");
    process.exit(0);
  });

  process.on("SIGINT", () => {
    NATS.client.close();
  });

  process.on("SIGTERM", () => {
    NATS.client.close();
  });

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

main();

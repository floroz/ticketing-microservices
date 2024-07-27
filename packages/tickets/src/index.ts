import { app } from "./app";
import { logger } from "./logger";
import { NATS } from "floroz-ticketing-common";
import { connectDB } from "./db/connect";

const PORT = 3001;
const clientId = process.env.NATS_CLIENT_ID;
const clusterId = process.env.NATS_CLUSTER_ID;
const url = process.env.NATS_URL;

if (!clientId || !clusterId || !url) {
  throw new Error(
    "NATS_CLIENT_ID, NATS_CLUSTER_ID and NATS_URL must be defined"
  );
}

if (process.env.JWT_SECRET == null) {
  throw new Error("JWT_SECRET must be defined");
} else {
  logger.info("JWT_Secret loaded.");
}

const main = async () => {
  try {
    await connectDB();
    await NATS.connect(clusterId, clientId, url);
    logger.info("NATS connected");
  } catch (error) {
    logger.error(error);
  }

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

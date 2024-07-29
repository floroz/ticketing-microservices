import { logger } from "./logger";
import { NATS } from "floroz-ticketing-common";
import http from "node:http";
import bull from "bull";

const PORT = 3006;
const clientId = process.env.NATS_CLIENT_ID;
const clusterId = process.env.NATS_CLUSTER_ID;
const url = process.env.NATS_URL;

if (!clientId || !clusterId || !url) {
  throw new Error(
    "NATS_CLIENT_ID, NATS_CLUSTER_ID and NATS_URL must be defined"
  );
}

const main = async () => {
  const server = http.createServer((req, res) => {
    res.end("Hello from expiration service");
  });
  try {
    // await connectDB(); // connect to redis
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

  server.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

main();

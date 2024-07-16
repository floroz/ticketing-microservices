import nats from "node-nats-streaming";
import { logger } from "../../logger";

/**
 * NATS client
 */
let client: nats.Stan;

const initStanClient = async (): Promise<void> => {
  const clientId = process.env.NATS_CLIENT_ID || "tickets";
  const clusterId = process.env.NATS_CLUSTER_ID || "ticketing";
  const url = process.env.NATS_URL || "http://nats-srv.default:4222";
  try {
    client = await nats.connect(clusterId, clientId, {
      url,
    });
    logger.info("NATS client connected");
  } catch (error) {
    logger.error("Error in connecting to NATS.", error);
    throw error;
  }

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
};

const getStanClient = (): nats.Stan => {
  if (client) {
    return client;
  }
  throw new Error("NATS client not initialized");
};

export { getStanClient, initStanClient };

import nats from "node-nats-streaming";

/**
 * NATS client
 */
let client: nats.Stan;

const initNatsClient = async (): Promise<nats.Stan> => {
  if (client) {
    return client;
  }
  const clientId = process.env.NATS_CLIENT_ID || "tickets";
  const clusterId = process.env.NATS_CLUSTER_ID || "ticketing";
  const url = process.env.NATS_URL || "http://nats-srv.default:4222";
  client = await nats.connect(clusterId, clientId, {
    url,
  });
  return client;
};

export { client as stanClient, initNatsClient };

import { logger } from "./logger";
import {
  Consumer,
  NATS,
  OrderCreatedEvent,
  OrderExpired,
  Producer,
  Topics,
} from "floroz-ticketing-common";
import Queue from "bull";
import { Message } from "node-nats-streaming";
import http from "node:http";

type Job = {
  orderId: string;
};

const clientId = process.env.NATS_CLIENT_ID;
const clusterId = process.env.NATS_CLUSTER_ID;
const url = process.env.NATS_URL;

if (!clientId || !clusterId || !url) {
  throw new Error(
    "NATS_CLIENT_ID, NATS_CLUSTER_ID and NATS_URL must be defined"
  );
}

const expirationQueue = new Queue<Job>(
  Topics.OrderExpired,
  process.env.REDIS_URI!
);

const main = async () => {
  try {
    await NATS.connect(clusterId, clientId, url);
    logger.info("NATS connected");
  } catch (error) {
    logger.error({ error }, "Error connecting to NATS");
  }

  NATS.client.on("close", () => {
    logger.info("NATS connection closed");
    process.exit(0);
  });

  const consumer = new OrderCreatedConsumer(NATS.client);
  const producer = new OrderExpiredProducer(NATS.client);

  expirationQueue.on("error", (error) => {
    logger.error({ error }, `Expiration queue error`);
  });

  expirationQueue.on("active", () => {
    logger.info("Queue is active");
  });

  expirationQueue.process(async (job) => {
    logger.info({ job }, `Processing job: ${job.id}`);
    try {
      await producer.publish({
        id: job.data.orderId,
      });
      logger.info(
        { id: job.id, data: job.data },
        `Published order expired event`
      );
    } catch (error) {
      logger.error({ error }, `Error publishing order expired event`);
    }
  });

  process.on("SIGINT", () => {
    NATS.client.close();
  });

  process.on("SIGTERM", () => {
    NATS.client.close();
  });

  consumer.listen();

  const server = http.createServer(() => {});

  server.listen(3000, () => {
    logger.info("Server is running on port 3000");
  });
};

main();

class OrderCreatedConsumer extends Consumer<OrderCreatedEvent> {
  readonly topic = Topics.OrderCreated;
  readonly queueGroup = "expiration-service";

  async onMessage(
    data: OrderCreatedEvent["data"],
    message: Message
  ): Promise<void> {
    // TODO: EXPIRATION should be configurable
    const EXPIRATION = 5 * 1000;
    const expiresAtDate = new Date(data.expiresAt);
    const currentTime = new Date();
    const remainingTime = expiresAtDate.getTime() - currentTime.getTime();
    const delay = remainingTime - EXPIRATION;
    console.log("delay: ", delay / 1000);
    try {
      await expirationQueue.add(
        { orderId: data.id },
        {
          // in case the job arrives late, beyond the expiration time
          // we use max(0, delay) to avoid negative delay
          // delay: Math.max(0, delay),

          // debug
          delay: 5000,
        }
      );
      logger.info(`Added job to queue with id ${data.id}`);
      message.ack();
    } catch (error) {
      logger.error({ error }, "Error adding job to queue");
    }
  }
}

class OrderExpiredProducer extends Producer<OrderExpired> {
  readonly topic = Topics.OrderExpired;
}

import type { Stan } from "node-nats-streaming";
import { BaseCustomEvent } from "./types";
import { withRetry } from "../utils";
import { logger } from "../logger";

export abstract class Producer<T extends BaseCustomEvent> {
  abstract readonly topic: T["topic"];

  constructor(protected readonly client: Stan) {}

  onConnect(cb?: () => void): void {
    this.client.on("connect", () => {
      cb?.();
    });
  }

  onClose(cb?: () => void): void {
    this.client.on("close", () => {
      cb?.();
    });
  }

  async publish(
    data: T["data"],
    opts?: { maxRetries?: number; delay?: number }
  ): Promise<void> {
    const event = {
      topic: this.topic,
      data,
    };
    await withRetry(
      () =>
        new Promise<void>((resolve, reject) => {
          logger.debug("Publishing event...", event);
          this.client.publish(this.topic, JSON.stringify(event), (err) => {
            if (err) {
              logger.error("Error publishing event", err);
              reject(err);
            } else {
              logger.info("Event published", event);
              resolve();
            }
          });
        }),
      /**
       * We want to always ensure that the event is published to the topic.
       * We can set the maxRetries to Infinity to ensure that the event is published to the topic.
       */
      opts?.maxRetries ?? Infinity,
      opts?.delay || 1000
    );
  }

  close(): void {
    this.client.close();
  }
}

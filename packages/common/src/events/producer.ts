import type { Stan } from "node-nats-streaming";
import { BaseCustomEvent } from "./types";
import { withRetry } from "../utils";
import { logger } from "../logger";

export abstract class Producer<T extends BaseCustomEvent> {
  abstract readonly topic: T["topic"];

  constructor(private readonly client: Stan) {}

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

  publish(data: T["data"]): Promise<void> {
    const event = {
      topic: this.topic,
      data,
    };
    return new Promise<void>((resolve, reject) => {
      this.client.publish(this.topic, JSON.stringify(event), (err) => {
        if (err) {
          logger.error("Error publishing event", err);
          reject(err);
        } else {
          logger.info("Event published", event);
          resolve();
        }
      });
    });
  }

  close(): void {
    this.client.close();
  }
}

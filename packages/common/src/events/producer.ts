import type { Stan } from "node-nats-streaming";
import { BaseCustomEvent } from "./types";

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

  publish(event: T): Promise<void> {
    return new Promise((resolve, reject) => {
      this.client.publish(this.topic, JSON.stringify(event), (err) => {
        if (err) {
          reject(err);
        }
        resolve(undefined);
      });
    });
  }

  close(): void {
    this.client.close();
  }
}

import type { Stan } from "node-nats-streaming";
import { BaseCustomEvent } from "./types";

export abstract class Producer<T extends BaseCustomEvent> {
  abstract readonly topic: T["topic"];
  abstract logMessage(event: T): void;

  constructor(protected readonly client: Stan) {}

  onConnect(cb: () => void): void {
    this.client.on("connect", () => {
      console.log(`Connected to topic: ${this.topic}`);
      cb();
    });
  }

  onClose(cb: () => void): void {
    this.client.on("close", () => {
      console.log(`Closed connection to topic: ${this.topic}`);
      cb();
    });
  }

  publish(event: T) {
    const data = JSON.stringify(event);
    this.client.publish(this.topic, data);
    this.logMessage(event);
  }

  close(): void {
    this.client.close();
  }
}

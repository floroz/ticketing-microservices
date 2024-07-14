import type {
  Message,
  SubscriptionOptions,
  Stan,
  Subscription,
} from "node-nats-streaming";
import { BaseCustomEvent } from "./types";

export abstract class Consumer<T extends BaseCustomEvent> {
  abstract readonly topic: T["topic"];
  abstract readonly queueGroup: string;
  abstract onMessage(event: T, message: Message): void;
  abstract logMessage(event: T, message: Message): void;

  protected ackWait: number = 5 * 1000;

  constructor(protected readonly client: Stan) {}

  subscribeOptions(): SubscriptionOptions {
    return this.client
      .subscriptionOptions()
      .setManualAckMode(true)
      .setDeliverAllAvailable()
      .setDurableName(this.queueGroup);
  }

  onConnect(cb: () => void): void {
    this.client.on("connect", () => {
      cb();
    });
  }

  onClose(cb: () => void): void {
    this.client.on("close", () => {
      cb();
    });
  }

  listen(): Subscription {
    const sub = this.client.subscribe(
      this.topic,
      this.queueGroup,
      this.subscribeOptions()
    );

    sub.on("message", (msg: Message) => {
      const parsedData = this.parseMessage(msg);
      this.logMessage(parsedData, msg);
      this.onMessage(parsedData, msg);
    });

    return sub;
  }

  close(): void {
    this.client.close();
  }

  private parseMessage(msg: Message): T {
    const data = msg.getData();
    return (
      typeof data === "string"
        ? JSON.parse(data)
        : JSON.parse(data.toString("utf-8"))
    ) as T;
  }
}

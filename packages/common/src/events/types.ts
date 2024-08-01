import { OrderStatus } from "../types";
import { Topics } from "./topics";

export type BaseCustomEvent = {
  topic: Topics;
  data: unknown;
};

export type TicketCreatedEvent = {
  topic: Topics.TicketCreated;
  data: {
    id: string;
    userId: string;
    title: string;
    price: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
    version: number;
  };
};

export type TicketUpdatedEvent = {
  topic: Topics.TicketUpdated;
  data: {
    id: string;
    userId: string;
    title: string;
    price: number;
    currency: string;
    createdAt: string;
    updatedAt: string;
    version: number;
  };
};

export type TicketDeletedEvent = {
  topic: Topics.TicketDeleted;
  data: {
    id: string;
    userId: string;
    version: number;
  };
};

export type OrderCreatedEvent = {
  topic: Topics.OrderCreated;
  data: {
    id: string;
    userId: string;
    status: OrderStatus.Created;
    ticket: {
      id: string;
      price: number;
      currency: string;
    };
    expiresAt: string;
    version: number;
  };
};

export type OrderUpdatedEvent = {
  topic: Topics.OrderUpdated;
  data: {
    id: string;
    userId: string;
    status: OrderStatus;
    ticket: {
      id: string;
      price: number;
      currency: string;
    };
    expiresAt: string;
    version: number;
  };
};

export type OrderCancelledEvent = {
  topic: Topics.OrderCancelled;
  data: {
    id: string;
    userId: string;
    status: OrderStatus.Cancelled;
    ticket: {
      id: string;
      price: number;
      currency: string;
    };
    expiresAt: string;
  };
  version: number;
};

export type OrderExpiredEvent = {
  topic: Topics.OrderExpired;
  data: {
    id: string;
  };
};

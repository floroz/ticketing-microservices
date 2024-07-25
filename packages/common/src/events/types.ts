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
  };
};

export type TicketDeletedEvent = {
  topic: Topics.TicketDeleted;
  data: {
    id: string;
    userId: string;
  };
};

export type OrderCreatedEvent = {
  topic: Topics.OrderCreated;
  data: {
    id: string;
    userId: string;
    ticket: {
      id: string;
      price: number;
      currency: string;
    };
    expiresAt: string;
  };
};

export type OrderDeletedEvent = {
  topic: Topics.OrderCancelled;
  data: {
    id: string;
    userId: string;
    ticket: {
      id: string;
      price: number;
      currency: string;
    };
  };
};

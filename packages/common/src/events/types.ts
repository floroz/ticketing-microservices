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
    createdAt: Date;
    updatedAt: Date;
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
    createdAt: Date;
    updatedAt: Date;
  };
};

export type TicketDeletedEvent = {
  topic: Topics.TicketDeleted;
  data: {
    id: string;
  };
};

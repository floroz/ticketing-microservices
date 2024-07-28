import mongoose from "mongoose";
import { Order } from "./order-model";
import { OrderStatus } from "floroz-ticketing-common";

type TicketDTO = {
  id: string;
  title: string;
  price: number;
  currency: string;
  version: number;
  userId: string;
};

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(ticket: TicketDTO): TicketDoc;
  findByEvent(event: {
    id: string;
    version: number;
  }): Promise<TicketDoc | null>;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  version: number;
  isReserved(): boolean;
}

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

ticketSchema.set("toJSON", {
  transform: (_: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

/**
 * Reserved means that the ticket exist in an order that is not cancelled
 */
ticketSchema.methods.isReserved = async function isReserved() {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $ne: OrderStatus.Cancelled,
    },
  });

  return !!existingOrder;
};

ticketSchema.statics.findByEvent = async function findByEvent(event: {
  id: string;
  version: number;
}): Promise<TicketDoc | null> {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

ticketSchema.statics.build = ({ id, ...rest }: TicketDTO) => {
  const ticket: Omit<TicketDTO, "id"> & {
    _id: string;
  } = {
    ...rest,
    _id: id,
  };
  return new Ticket(ticket);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { type TicketDoc, Ticket };

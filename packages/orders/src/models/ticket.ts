import mongoose from "mongoose";
import { Order } from "./order";
import { OrderStatus } from "floroz-ticketing-common";

type TicketDTO = {
  title: string;
  price: number;
  currency: string;
  version: number;
};

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(ticket: TicketDTO): TicketDoc;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  currency: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
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

ticketSchema.statics.build = (payload: TicketDTO) => {
  return new Ticket(payload);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { type TicketDoc, Ticket };

import mongoose from "mongoose";
import { Order } from "./order";
import { OrderStatus } from "floroz-ticketing-common";

type TicketDTO = {
  id: string;
  title: string;
  price: number;
  currency: string;
};

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(ticket: TicketDTO): TicketDoc;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  currency: string;
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
  const ticket: Omit<TicketDTO, "id"> & { _id: string } = {
    currency: payload.currency,
    price: payload.price,
    title: payload.title,
    _id: payload.id,
  };
  return new Ticket(ticket);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { type TicketDoc, Ticket };

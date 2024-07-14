import mongoose from "mongoose";

type TicketCreationPayload = {
  title: string;
  price: number;
  currency: string;
  userId: string;
};

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(payload: TicketCreationPayload): TicketDoc;
}

interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  currency: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
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
  },
  {
    timestamps: true,
  }
);

ticketSchema.set("toJSON", {
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

ticketSchema.statics.build = (payload: TicketCreationPayload) => {
  return new Ticket(payload);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };

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

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  currency: string;
  userId: string;
  /**
   * ISO Timestamp
   */
  createdAt: string;
  /**
   * ISO Timestamp
   */
  updatedAt: string;
}

const ticketSchema = new mongoose.Schema({
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
  createdAt: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: String,
    required: true,
  },
});

ticketSchema.set("toJSON", {
  transform: (doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

ticketSchema.statics.build = (payload: TicketCreationPayload) => {
  return new Ticket(payload);
};

ticketSchema.pre("save", async function (done) {
  this.createdAt = new Date().toISOString();
  this.updatedAt = new Date().toISOString();
  done();
});

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };

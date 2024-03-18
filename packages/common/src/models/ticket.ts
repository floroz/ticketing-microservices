import mongoose from "mongoose";

type TicketCreationPayload = {
};

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(payload: TicketCreationPayload): TicketDoc;
}

export interface TicketDoc extends mongoose.Document {
}

const ticketSchema = new mongoose.Schema({
});

ticketSchema.set("toJSON", {
  transform: (doc: any, ret: any) => {
    delete ret.password;
    delete ret.__v;
    ret.id = ret._id;
    delete ret._id;
  },
});

ticketSchema.statics.build = (payload: TicketCreationPayload) => {
  return new Ticket(payload);
};

ticketSchema.pre("save", async function (done) {
  done();
});

const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", ticketSchema);

export { Ticket };

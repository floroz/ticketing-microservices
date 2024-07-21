import mongoose from "mongoose";

type OrderCreationDTO = {
  ticket: TicketDoc;
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
};

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(order: OrderCreationDTO): OrderDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  ticket: TicketDoc;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.set("toJSON", {
  transform: (_: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

orderSchema.statics.build = (payload: OrderCreationDTO) => {
  return new Order(payload);
};

export { Order };

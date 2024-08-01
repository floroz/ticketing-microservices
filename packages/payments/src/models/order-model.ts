import { OrderStatus } from "floroz-ticketing-common";
import mongoose from "mongoose";

type OrderCreationDTO = {
  id: string;
  status: OrderStatus;
  userId: string;
  version: number;
  tickets: Array<{
    id: string;
    price: number;
    currency: string;
  }>;
};

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(order: OrderCreationDTO): OrderDoc;
  findByEvent(event: { id: string; version: number }): Promise<OrderDoc | null>;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  tickets: Array<{
    id: string;
    price: number;
    currency: string;
  }>;
  version: number;
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
      enum: Object.values(OrderStatus),
    },
    tickets: {
      type: [
        {
          id: {
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
      ],
      required: true,
    },
    version: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

orderSchema.set("toJSON", {
  transform: (_: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

orderSchema.statics.findByEvent = async function findByEvent(event: {
  id: string;
  version: number;
}): Promise<OrderDoc | null> {
  return Order.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};

orderSchema.statics.build = ({ id, ...rest }: OrderCreationDTO) => {
  const ticket: Omit<OrderCreationDTO, "id"> & {
    _id: string;
  } = {
    ...rest,
    _id: id,
  };
  return new Order(ticket);
};

const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);

export { Order };

import mongoose from "mongoose";

type PaymentCreationDTO = {
  orderId: string;
  stripeId: string;
};

interface PaymentModel extends mongoose.Model<PaymentDoc> {
  build(payment: PaymentCreationDTO): PaymentDoc;
}

interface PaymentDoc extends mongoose.Document {
  orderId: string;
  stripeId: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    stripeId: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.set("toJSON", {
  transform: (_: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
  },
});

paymentSchema.statics.build = (payment: PaymentCreationDTO) => {
  return new Payment(payment);
};

const Payment = mongoose.model<PaymentDoc, PaymentModel>(
  "Payment",
  paymentSchema
);

export { Payment };

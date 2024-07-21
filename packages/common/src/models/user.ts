import mongoose from "mongoose";
import { PasswordService } from "../services/password";

type UserCreationDTO = {
  email: string;
  password: string;
};

interface UserModel extends mongoose.Model<UserDoc> {
  build(user: UserCreationDTO): UserDoc;
}

export interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  role: "admin" | "user";
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: "user",
  },
});

userSchema.set("toJSON", {
  transform: (_: any, ret: any) => {
    delete ret.password;
    delete ret.__v;
    ret.id = ret._id;
    delete ret._id;
  },
});

userSchema.statics.build = (payload: UserCreationDTO) => {
  return new User(payload);
};

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashedPassword = await PasswordService.hash(this.get("password"));
    this.set("password", hashedPassword);
  }
  done();
});

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };

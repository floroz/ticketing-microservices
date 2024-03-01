import mongoose from "mongoose";
import { PasswordService } from "../services/password";

type UserCreationPayload = {
  email: string;
  password: string;
};

interface UserModel extends mongoose.Model<UserDoc> {
  build(payload: UserCreationPayload): UserDoc;
}

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
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
});

userSchema.statics.build = (payload: UserCreationPayload) => {
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

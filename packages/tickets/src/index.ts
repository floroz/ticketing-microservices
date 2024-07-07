import mongoose from "mongoose";
import { DatabaseConnectionError } from "floroz-ticketing-common";
import { app } from "./app";

const port = 3001;

const main = async () => {
  if (process.env.JWT_SECRET == null) {
    throw new Error("JWT_SECRET must be defined");
  } else {
    console.log("JWT_Secret loaded.");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }
  try {
    const m = await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
    throw new DatabaseConnectionError();
  }

  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

main();

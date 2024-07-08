import express, { Request, Response } from "express";
import cookieSession from "cookie-session";
import morgan from "morgan";
import {
  JWTService,
  NotFoundError,
  errorHandlerMiddlewere,
} from "floroz-ticketing-common";
import { createRouter } from "./routes/tickets";

const app = express();

app.use(morgan("dev"));

// Trusting the ingress-nginx proxy
app.set("trust proxy", true);

app.use(
  cookieSession({
    name: "session",
    signed: false,
    // secure: true,
  })
);

app.use(express.json());

app.use("/api/tickets", createRouter(new JWTService(process.env.JWT_SECRET!)));

app.use("*", () => {
  throw new NotFoundError();
});

app.use(errorHandlerMiddlewere);

export { app };

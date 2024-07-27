import express from "express";
import cookieSession from "cookie-session";
import morgan from "morgan";
import {
  NotFoundError,
  currentUserMiddleware,
  errorHandlerMiddlewere,
  requireAuth,
} from "floroz-ticketing-common";
import { ticketRouter } from "./routes/tickets-router";
import { jwtService } from "./services/jwt";

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

app.use(
  "/api/tickets",
  [currentUserMiddleware(jwtService), requireAuth()],
  ticketRouter
);

app.use("*", () => {
  throw new NotFoundError();
});

app.use(errorHandlerMiddlewere);

export { app };

import express, { Request, Response } from "express";
import cookieSession from "cookie-session";
import morgan from "morgan";
import {
  NotFoundError,
  authGuardMiddleware,
  errorHandlerMiddlewere,
} from "floroz-ticketing-common";

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

app.get("/api/ticket", (req: Request, res: Response) => {
  res.send("Hello, ticket!");
});

app.post("/api/ticket", authGuardMiddleware, (req: Request, res: Response) => {
  res.send("Hello, ticket!");
});

app.use("*", () => {
  throw new NotFoundError();
});

app.use(errorHandlerMiddlewere);

export { app };

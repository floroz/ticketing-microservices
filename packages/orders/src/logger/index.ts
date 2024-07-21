import logger from "pino";

const ticketLogger = logger({
  name: "orders",
});

export { ticketLogger as logger };

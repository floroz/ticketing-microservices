import logger from "pino";

const ticketLogger = logger({
  name: "payments",
});

export { ticketLogger as logger };

import logger from "pino";

const ticketLogger = logger({
  name: "tickets",
});

export { ticketLogger as logger };

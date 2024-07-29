import logger from "pino";

const expirationLogger = logger({
  name: "expiration",
});

export { expirationLogger as logger };

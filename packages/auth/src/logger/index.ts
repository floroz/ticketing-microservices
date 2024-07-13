import logger from "pino";

const authLogger = logger({
  name: "auth",
});

export { authLogger as logger };

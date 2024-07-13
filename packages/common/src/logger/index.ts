import logger from "pino";

const commonLogger = logger({
  name: "common",
});

export { commonLogger as logger };

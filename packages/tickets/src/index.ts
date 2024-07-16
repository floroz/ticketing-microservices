import { app } from "./app";
import { logger } from "./logger";
import { initStanClient } from "./events/nats/client";
import { connectDB } from "./db/connect";

const PORT = 3001;

const main = async () => {
  if (process.env.JWT_SECRET == null) {
    throw new Error("JWT_SECRET must be defined");
  } else {
    logger.info("JWT_Secret loaded.");
  }

  await connectDB();

  await initStanClient();

  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

main();

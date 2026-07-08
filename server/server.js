import app from "./app.js";
import { connectDatabase } from "./config/database.js";
import { env, logEnvironmentStatus } from "./config/env.js";

async function startServer() {
  logEnvironmentStatus();
  await connectDatabase();

  app.listen(env.port, () => {
    console.log(`OTOATO API listening on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});

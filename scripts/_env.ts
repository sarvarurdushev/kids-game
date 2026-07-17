import { config } from "dotenv";

// Must be the first import in every script entry point (before anything
// that reads process.env at module-load time, like lib/db/client.ts).
config({ path: ".env.local" });

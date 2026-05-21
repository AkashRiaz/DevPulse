import dotenv from "dotenv"
import path from "path";
import { env } from "process";

dotenv.config({
  path: path.join(process.cwd(), ".env"),
});

const config = {
    port: env.PORT || 5000,
    database_url: env.DATABASE_URL as string
}

export default config;
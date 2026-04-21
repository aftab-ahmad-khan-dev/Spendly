import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";
import { env, isProd } from "./config/env.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middlewares/error.middleware.js";
import { logger } from "./utils/logger.js";

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));

// CORS — comma-separated allowlist, or "*" to reflect any origin.
// Wildcard cannot be a literal "*" header when credentials: true, so we echo
// the incoming Origin back instead.
const allowedOrigins = env.clientOrigin
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const allowAny = allowedOrigins.includes("*");

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl, server-to-server, health checks
      if (allowAny) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (
        allowedOrigins.some((o) => o.endsWith(".vercel.app")) &&
        origin.endsWith(".vercel.app")
      ) {
        return cb(null, true); // allow preview deployments
      }
      return cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(isProd ? "combined" : "dev"));

// Public endpoints (no Clerk) mounted before auth middleware
app.get("/", (_req, res) => res.json({ name: "Spendly API", status: "running" }));
app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

// Clerk only enabled when a secret key is configured
if (env.clerk.secretKey) {
  app.use(
    clerkMiddleware({
      publishableKey: env.clerk.publishableKey,
      secretKey: env.clerk.secretKey,
    }),
  );
} else {
  logger.warn(
    "CLERK_SECRET_KEY is not set authenticated API routes will return 401. Add it to server/.env to enable auth.",
  );
}

app.use("/api", routes);

app.use(notFound);
app.use(errorHandler);

export default app;

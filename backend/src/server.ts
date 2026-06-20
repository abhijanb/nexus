import http from "http";
import express from "express";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";
import { errorHandler } from "./utils/errorHandler";
import { corsMiddleware } from "./middleware/corsMiddleware";
import { csrfProtection } from "./middleware/csrfProtection";
import { authLimiter, apiLimiter } from "./middleware/rateLimiter";
import { env, validateEnv } from "./config/env";
import { setupSocket } from "./lib/socket";
import channelRoutes from "./features/channel/route";
import uploadRoutes from "./features/upload/route";
import userRoutes from "./features/user/route";
import notifyRoutes from "./features/notification/route";
import dmRoutes from "./features/dm/route";
import friendRoutes from "./features/friend/route";
import taskRoutes from "./features/task/route";
import searchRoutes from "./features/search/route";
import { prisma } from "./lib/prisma";
import { successResponse } from "./utils/response";
import { startTaskScheduler } from "./services/taskScheduler";
import { setupSearchIndexes } from "./lib/searchIndexes";

validateEnv();
const app = express();
const port = env.PORT || 3000;

app.use(corsMiddleware);
app.use(csrfProtection);
app.use(cookieParser());

app.all('/api/auth/{*any}', toNodeHandler(auth));

// Mount express json middleware after Better Auth handler
// or only apply it to routes that don't interact with Better Auth
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api/upload", apiLimiter, uploadRoutes);
app.use("/api/channel", apiLimiter, channelRoutes);
app.use("/api/user", apiLimiter, userRoutes);
app.use("/api/notifications", apiLimiter, notifyRoutes);
app.use("/api/dm", apiLimiter, dmRoutes);
app.use("/api/friends", apiLimiter, friendRoutes);
app.use("/api/tasks", apiLimiter, taskRoutes);
app.use("/api/search", apiLimiter, searchRoutes);

app.get("/health", async (_req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        successResponse(res, { status: "healthy", db: "connected" }, "Server is running");
    } catch {
        res.status(503).json({
            status: "error",
            message: "Database connection failed",
            data: { status: "unhealthy", db: "disconnected" },
        });
    }
});

app.use(errorHandler);

const server = http.createServer(app);
setupSocket(server);
startTaskScheduler();
setupSearchIndexes().catch((err) => console.error("Failed to setup search indexes:", err));

server.listen(port, () => {
    console.log(`Better Auth app listening on port ${port}`);
});
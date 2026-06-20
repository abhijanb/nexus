import rateLimit from "express-rate-limit";
import { env } from "../config/env";

const windowMs = env.RATE_LIMIT_WINDOW_SECONDS * 1000;

const defaults = {
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." } as const,
};

export const authLimiter = rateLimit({
    windowMs,
    max: env.AUTH_RATE_LIMIT_MAX,
    ...defaults,
});

export const apiLimiter = rateLimit({
    windowMs,
    max: env.API_RATE_LIMIT_MAX,
    ...defaults,
});

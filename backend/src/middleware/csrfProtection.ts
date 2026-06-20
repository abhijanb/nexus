import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";

const ALLOWED_ORIGINS = [env.FRONTEND_URL, `http://localhost:${env.PORT}`].filter(Boolean);

export function csrfProtection(req: Request, res: Response, next: NextFunction) {
    if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") {
        return next();
    }

    const origin = req.headers.origin;
    const referer = req.headers.referer as string | undefined;

    if (origin) {
        if (!ALLOWED_ORIGINS.includes(origin)) {
            return res.status(403).json({ message: "Forbidden" });
        }
        return next();
    }

    if (!origin && !referer) {
        return next();
    }

    try {
        const refererUrl = new URL(referer!);
        const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
        if (!ALLOWED_ORIGINS.includes(refererOrigin)) {
            return res.status(403).json({ message: "Forbidden" });
        }
    } catch {
        return res.status(403).json({ message: "Invalid referer" });
    }

    next();
}

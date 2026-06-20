import type { IncomingHttpHeaders } from "http";
import type { NextFunction, Request, Response } from "express";
import { auth } from "../lib/auth";
import { logger } from "../lib/logger";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
                emailVerified: boolean;
                image?: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        }
    }
}

function headersToRecord(headers: IncomingHttpHeaders): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
        if (value === undefined) continue;
        result[key] = Array.isArray(value) ? value.join(", ") : value;
    }
    return result;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const session = await auth.api.getSession({
        headers: headersToRecord(req.headers),
    });

    if (!session) {
        logger.warn({ path: req.path }, "401 — no valid session");
        return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = { ...session.user, image: session.user.image ?? null };
    next();
}

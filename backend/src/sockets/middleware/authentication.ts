import type { Socket } from "socket.io";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { env } from "../../config/env";
import type { IncomingHttpHeaders } from "http";

const ALLOWED_ORIGINS = [env.FRONTEND_URL].filter(Boolean);

function headersToRecord(headers: IncomingHttpHeaders): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
        if (value === undefined) continue;
        result[key] = Array.isArray(value) ? value.join(", ") : value;
    }
    return result;
}

export async function socketAuth(socket: Socket, next: (err?: Error) => void) {
    const origin = socket.handshake.headers.origin;
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
        return next(new Error("Cross-origin connection denied"));
    }

    const session = await auth.api.getSession({
        headers: headersToRecord(socket.handshake.headers),
    });

    if (session) {
        socket.data.user = session.user;
        return next();
    }

    const token = socket.handshake.auth.token;
    if (!token || typeof token !== "string") {
        return next(new Error("Authentication required"));
    }

    const tokenId = token.split(".")[0];
    if (!tokenId) {
        return next(new Error("Invalid token format"));
    }

    const dbSession = await prisma.session.findUnique({
        where: { token: tokenId },
    });

    if (!dbSession || dbSession.expiresAt < new Date()) {
        return next(new Error("Invalid or expired token"));
    }

    const user = await prisma.user.findUnique({ where: { id: dbSession.userId } });
    if (!user) {
        return next(new Error("User not found"));
    }

    socket.data.user = user;
    next();
}

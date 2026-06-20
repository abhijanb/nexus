import type { Socket } from "socket.io";
import type { Server } from "socket.io";
import type { ClientToServerEvents, ServerToClientEvents, TypingPayload } from "../types";

export function handleTypingStart(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    data: TypingPayload,
) {
    const user = socket.data.user;
    if (!user) return;

    if (data.channelId) {
        socket.broadcast.to(data.channelId).emit("typing:status", {
            channelId: data.channelId,
            userId: user.id,
            userName: user.name,
            isTyping: true,
        });
    } else if (data.conversationId && data.toUserId) {
        io.to(`user:${data.toUserId}`).emit("typing:status", {
            conversationId: data.conversationId,
            userId: user.id,
            userName: user.name,
            isTyping: true,
        });
    }
}

export function handleTypingStop(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    data: TypingPayload,
) {
    const user = socket.data.user;
    if (!user) return;

    if (data.channelId) {
        socket.broadcast.to(data.channelId).emit("typing:status", {
            channelId: data.channelId,
            userId: user.id,
            userName: user.name,
            isTyping: false,
        });
    } else if (data.conversationId && data.toUserId) {
        io.to(`user:${data.toUserId}`).emit("typing:status", {
            conversationId: data.conversationId,
            userId: user.id,
            userName: user.name,
            isTyping: false,
        });
    }
}

import type { Socket } from "socket.io";
import type { Server } from "socket.io";
import { messageService } from "../service/message";
import type { ClientToServerEvents, ServerToClientEvents, DeleteMessagePayload, SendMessagePayload } from "../types";

export function handleJoinChannel(socket: Socket<ClientToServerEvents, ServerToClientEvents>, channelId: string) {
    socket.join(channelId);
}

export function handleLeaveChannel(socket: Socket<ClientToServerEvents, ServerToClientEvents>, channelId: string) {
    socket.leave(channelId);
}

export async function handleSendMessage(socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server<ClientToServerEvents, ServerToClientEvents>, data: SendMessagePayload) {
    const user = socket.data.user;

    if (!data.channelId || !data.content) {
        socket.emit("error:message", { message: "channelId and content are required" });
        return;
    }

    if (data.content.length > 10000) {
        socket.emit("error:message", { message: "Message too long" });
        return;
    }

    const message = await messageService.persistAndFormat(data.channelId, data.content, user.id);
    const socketMessage = { ...message, createdAt: message.createdAt.toISOString() };
    io.to(data.channelId).emit("new:message", socketMessage);
}

export async function handleDeleteMessage(socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server<ClientToServerEvents, ServerToClientEvents>, data: DeleteMessagePayload) {
    const user = socket.data.user;

    if (!data.channelId || !data.messageId) {
        socket.emit("error:message", { message: "channelId and messageId are required" });
        return;
    }

    try {
        await messageService.deleteMessage(user.id, data.channelId, data.messageId);
        io.to(data.channelId).emit("message:deleted", { channelId: data.channelId, messageId: data.messageId });
    } catch {
        socket.emit("error:message", { message: "Failed to delete message" });
    }
}

import type { Socket } from "socket.io";
import type { Server } from "socket.io";
import { dmService } from "../service/dm";
import type { ClientToServerEvents, ServerToClientEvents, DeleteDMMessagePayload, SendDMMessagePayload } from "../types";

export async function handleSendDm(socket: Socket<ClientToServerEvents, ServerToClientEvents>, io: Server<ClientToServerEvents, ServerToClientEvents>, data: SendDMMessagePayload) {
    const user = socket.data.user;

    if (!data.conversationId || !data.content) {
        socket.emit("error:message", { message: "conversationId and content are required" });
        return;
    }

    if (data.content.length > 10000) {
        socket.emit("error:message", { message: "Message too long" });
        return;
    }

    try {
        const { message, participants } = await dmService.persistAndFormat(data.conversationId, data.content, user.id);
        const socketMessage = { ...message, createdAt: message.createdAt.toISOString() };
        for (const participant of participants) {
            io.to(`user:${participant.userId}`).emit("new:dm", socketMessage);
        }
    } catch {
        socket.emit("error:message", { message: "Failed to send message" });
    }
}

export async function handleDeleteDm(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    data: DeleteDMMessagePayload,
) {
    const user = socket.data.user;

    if (!data.conversationId || !data.messageId) {
        socket.emit("error:message", { message: "conversationId and messageId are required" });
        return;
    }

    try {
        const { participants } = await dmService.deleteDirectMessage(user.id, data.conversationId, data.messageId);
        for (const participant of participants) {
            io.to(`user:${participant.userId}`).emit("dm:deleted", {
                conversationId: data.conversationId,
                messageId: data.messageId,
            });
        }
    } catch {
        socket.emit("error:message", { message: "Failed to delete message" });
    }
}

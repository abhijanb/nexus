import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env";
import { socketAuth } from "../sockets/middleware/authentication";
import { handleDeleteMessage, handleJoinChannel, handleLeaveChannel, handleSendMessage } from "../sockets/event/message";
import { handleDeleteDm, handleSendDm } from "../sockets/event/dm";
import { handleTypingStart, handleTypingStop } from "../sockets/event/typing";
import {
    handleVideoCallUser,
    handleVideoAcceptCall,
    handleVideoRejectCall,
    handleVideoOffer,
    handleVideoAnswer,
    handleVideoICECandidate,
    handleVideoEndCall,
} from "../sockets/event/videoCall";
import { presenceManager } from "../sockets/service/presence";
import type { ClientToServerEvents, ServerToClientEvents } from "../sockets/types";

let io: Server<ClientToServerEvents, ServerToClientEvents>;

export function setupSocket(server: HttpServer) {
    io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
        cors: {
            origin: env.FRONTEND_URL || "http://localhost:5173",
            credentials: true,
        },
    });

    io.use(socketAuth);

    io.on("connection", (socket) => {
        const userId = socket.data.user?.id;
        if (userId) {
            socket.join(`user:${userId}`);

            const cameOnline = presenceManager.addUser(userId, socket.id);
            if (cameOnline) {
                io.emit("user:online", { userId });
            }
        }

        socket.on("join:channel", (channelId) => handleJoinChannel(socket, channelId));
        socket.on("leave:channel", (channelId) => handleLeaveChannel(socket, channelId));
        socket.on("send:message", (data) => handleSendMessage(socket, io, data));
        socket.on("delete:message", (data) => handleDeleteMessage(socket, io, data));
        socket.on("send:dm", (data) => handleSendDm(socket, io, data));
        socket.on("delete:dm", (data) => handleDeleteDm(socket, io, data));
        socket.on("typing:start", (data) => handleTypingStart(socket, io, data));
        socket.on("typing:stop", (data) => handleTypingStop(socket, io, data));
        socket.on("video:call-user", (data) => handleVideoCallUser(socket, io, data));
        socket.on("video:accept-call", (data) => handleVideoAcceptCall(socket, io, data));
        socket.on("video:reject-call", (data) => handleVideoRejectCall(socket, io, data));
        socket.on("video:offer", (data) => handleVideoOffer(socket, io, data));
        socket.on("video:answer", (data) => handleVideoAnswer(socket, io, data));
        socket.on("video:ice-candidate", (data) => handleVideoICECandidate(socket, io, data));
        socket.on("video:end-call", (data) => handleVideoEndCall(socket, io, data));
        socket.on("disconnect", () => {
            if (userId) {
                const wentOffline = presenceManager.removeUser(userId, socket.id);
                if (wentOffline) {
                    io.emit("user:offline", { userId });
                }
            }
        });
    });

    return io;
}

export function getIO() {
    return io;
}

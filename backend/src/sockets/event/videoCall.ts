import type { Socket } from "socket.io";
import type { Server } from "socket.io";
import type {
    ClientToServerEvents,
    ServerToClientEvents,
    VideoCallPayload,
} from "../types";

export function handleVideoCallUser(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    data: VideoCallPayload
) {
    const user = socket.data.user;
    if (!data.conversationId) return;
    io.to(`user:${data.to}`).emit("video:incoming-call", {
        from: { id: user.id, name: user.name, image: user.image },
        conversationId: data.conversationId,
    });
}

export function handleVideoAcceptCall(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    data: VideoCallPayload
) {
    const user = socket.data.user;
    if (!data.conversationId) return;
    io.to(`user:${data.to}`).emit("video:call-accepted", {
        from: user.id,
        conversationId: data.conversationId,
    });
}

export function handleVideoRejectCall(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    data: { to: string }
) {
    io.to(`user:${data.to}`).emit("video:call-rejected", {
        from: socket.data.user.id,
    });
}

export function handleVideoOffer(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    data: { to: string; offer: RTCSessionDescriptionInit }
) {
    io.to(`user:${data.to}`).emit("video:offer", {
        from: socket.data.user.id,
        offer: data.offer,
    });
}

export function handleVideoAnswer(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    data: { to: string; answer: RTCSessionDescriptionInit }
) {
    io.to(`user:${data.to}`).emit("video:answer", {
        from: socket.data.user.id,
        answer: data.answer,
    });
}

export function handleVideoICECandidate(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    data: { to: string; candidate: RTCIceCandidateInit }
) {
    io.to(`user:${data.to}`).emit("video:ice-candidate", {
        from: socket.data.user.id,
        candidate: data.candidate,
    });
}

export function handleVideoEndCall(
    socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    io: Server<ClientToServerEvents, ServerToClientEvents>,
    data: { to: string }
) {
    io.to(`user:${data.to}`).emit("video:call-ended", {
        from: socket.data.user.id,
    });
}

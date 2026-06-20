import { io } from "socket.io-client";
import type { Socket, ManagerOptions, SocketOptions } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "./socket.types";

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
let currentToken: string | null = null;
let idleTimer: ReturnType<typeof setTimeout> | null = null;
let idleDisconnected = false;

const SOCKET_OPTIONS: Partial<ManagerOptions & SocketOptions> = {
    withCredentials: true,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
    randomizationFactor: 0.3,
};

function createSocket() {
    socket?.disconnect();
    socket = io(
        import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
        {
            ...SOCKET_OPTIONS,
            auth: currentToken ? { token: currentToken } : undefined,
        },
    ) as Socket<ServerToClientEvents, ClientToServerEvents>;
}

export function getSocket(): Socket<ServerToClientEvents, ClientToServerEvents> {
    if (!socket) createSocket();
    return socket!;
}

export function setAuthToken(token: string | null) {
    currentToken = token;
    if (socket) {
        socket.auth = { token };
        if (!socket.connected) {
            socket.connect();
        }
    }
}

export function setupIdleDisconnect(idleMs = 30_000) {
    const onVisibilityChange = () => {
        if (document.hidden) {
            idleTimer = setTimeout(() => {
                const s = getSocket();
                if (s.connected) {
                    idleDisconnected = true;
                    s.disconnect();
                }
            }, idleMs);
        } else {
            if (idleTimer) {
                clearTimeout(idleTimer);
                idleTimer = null;
            }
            if (idleDisconnected) {
                idleDisconnected = false;
                const s = getSocket();
                if (!s.connected) {
                    s.connect();
                }
            }
        }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
        document.removeEventListener("visibilitychange", onVisibilityChange);
        if (idleTimer) {
            clearTimeout(idleTimer);
            idleTimer = null;
        }
        idleDisconnected = false;
    };
}

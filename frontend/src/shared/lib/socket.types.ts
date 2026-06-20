export interface SocketMessage {
    id: string;
    content: string;
    channelId: string;
    senderId: string;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        image: string | null;
    };
}

export interface DMSocketMessage {
    id: string;
    content: string;
    conversationId: string;
    senderId: string;
    createdAt: string;
    sender: {
        id: string;
        name: string;
        image: string | null;
    };
}

export interface SendMessagePayload {
    channelId: string;
    content: string;
}

export interface SendDMMessagePayload {
    conversationId: string;
    content: string;
}

export interface ServerToClientEvents {
    "new:message": (message: SocketMessage) => void;
    "message:deleted": (data: { channelId: string; messageId: string }) => void;
    "new:dm": (message: DMSocketMessage) => void;
    "conversation:deleted": (data: { conversationId: string }) => void;
    "user:online": (data: { userId: string }) => void;
    "user:offline": (data: { userId: string }) => void;
    "member:joined": (data: { userId: string; name: string; image: string | null }) => void;
    "member:left": (data: { userId: string }) => void;
    "typing:status": (data: { channelId?: string; conversationId?: string; userId: string; userName: string; isTyping: boolean }) => void;
    "dm:deleted": (data: { conversationId: string; messageId: string }) => void;
    "error:message": (error: { message: string }) => void;
    "video:incoming-call": (data: { from: { id: string; name: string; image: string | null }; conversationId: string }) => void;
    "video:call-accepted": (data: { from: string; conversationId: string }) => void;
    "video:call-rejected": (data: { from: string }) => void;
    "video:offer": (data: { from: string; offer: RTCSessionDescriptionInit }) => void;
    "video:answer": (data: { from: string; answer: RTCSessionDescriptionInit }) => void;
    "video:ice-candidate": (data: { from: string; candidate: RTCIceCandidateInit }) => void;
    "video:call-ended": (data: { from: string }) => void;
    "notification:created": (data: { id: string; type: string; title: string; body?: string; link?: string }) => void;
}

export interface ClientToServerEvents {
    "join:channel": (channelId: string) => void;
    "leave:channel": (channelId: string) => void;
    "send:message": (data: SendMessagePayload) => void;
    "delete:message": (data: { channelId: string; messageId: string }) => void;
    "send:dm": (data: SendDMMessagePayload) => void;
    "delete:dm": (data: { conversationId: string; messageId: string }) => void;
    "typing:start": (data: { channelId?: string; conversationId?: string; toUserId?: string }) => void;
    "typing:stop": (data: { channelId?: string; conversationId?: string; toUserId?: string }) => void;
    "video:call-user": (data: { to: string; conversationId: string }) => void;
    "video:accept-call": (data: { to: string; conversationId: string }) => void;
    "video:reject-call": (data: { to: string }) => void;
    "video:offer": (data: { to: string; offer: RTCSessionDescriptionInit }) => void;
    "video:answer": (data: { to: string; answer: RTCSessionDescriptionInit }) => void;
    "video:ice-candidate": (data: { to: string; candidate: RTCIceCandidateInit }) => void;
    "video:end-call": (data: { to: string }) => void;
}

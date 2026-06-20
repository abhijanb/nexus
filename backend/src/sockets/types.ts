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

export interface SendMessagePayload {
    channelId: string;
    content: string;
}

export interface SendDMMessagePayload {
    conversationId: string;
    content: string;
}

export interface DeleteMessagePayload {
    channelId: string;
    messageId: string;
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

export interface MemberJoinedPayload {
    userId: string;
    name: string;
    image: string | null;
}

export interface MemberLeftPayload {
    userId: string;
}

export interface DeleteDMMessagePayload {
    conversationId: string;
    messageId: string;
}

export interface TypingPayload {
    channelId?: string;
    conversationId?: string;
    toUserId?: string;
}

export interface TypingStatusPayload {
    channelId?: string;
    conversationId?: string;
    userId: string;
    userName: string;
    isTyping: boolean;
}

export interface VideoCallPayload {
    to: string;
    conversationId?: string;
}

export interface VideoOfferPayload extends VideoCallPayload {
    offer: RTCSessionDescriptionInit;
}

export interface VideoAnswerPayload extends VideoCallPayload {
    answer: RTCSessionDescriptionInit;
}

export interface VideoICECandidatePayload extends VideoCallPayload {
    candidate: RTCIceCandidateInit;
}

export interface IncomingCallPayload {
    from: { id: string; name: string; image: string | null };
    conversationId: string;
}

export interface ServerToClientEvents {
    "new:message": (message: SocketMessage) => void;
    "message:deleted": (data: DeleteMessagePayload) => void;
    "new:dm": (message: DMSocketMessage) => void;
    "conversation:deleted": (data: { conversationId: string }) => void;
    "user:online": (data: { userId: string }) => void;
    "user:offline": (data: { userId: string }) => void;
    "member:joined": (data: MemberJoinedPayload) => void;
    "member:left": (data: MemberLeftPayload) => void;
    "error:message": (error: { message: string }) => void;
    "dm:deleted": (data: { conversationId: string; messageId: string }) => void;
    "typing:status": (data: TypingStatusPayload) => void;
    "video:incoming-call": (data: IncomingCallPayload) => void;
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
    "delete:message": (data: DeleteMessagePayload) => void;
    "send:dm": (data: SendDMMessagePayload) => void;
    "delete:dm": (data: DeleteDMMessagePayload) => void;
    "typing:start": (data: TypingPayload) => void;
    "typing:stop": (data: TypingPayload) => void;
    "video:call-user": (data: VideoCallPayload) => void;
    "video:accept-call": (data: VideoCallPayload) => void;
    "video:reject-call": (data: { to: string }) => void;
    "video:offer": (data: VideoOfferPayload) => void;
    "video:answer": (data: VideoAnswerPayload) => void;
    "video:ice-candidate": (data: VideoICECandidatePayload) => void;
    "video:end-call": (data: { to: string }) => void;
}

import { createContext, useContext, useEffect, useState, useCallback, useRef, type ReactNode } from "react";
import { getSocket } from "../../../shared/lib/socket";
import { IncomingCallDialog } from "./IncomingCallDialog";
import { VideoCallModal } from "./VideoCallModal";
import { OutgoingCallOverlay } from "./OutgoingCallOverlay";

interface CallUser {
    id: string;
    name: string;
    image: string | null;
}

interface CallState {
    status: CallStatus;
    conversationId: string | null;
}

interface VideoCallContextValue {
    startCall: (remoteUser: CallUser, conversationId: string) => void;
    endCall: () => void;
    callState: CallState;
}

const VideoCallContext = createContext<VideoCallContextValue | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useVideoCall() {
    const ctx = useContext(VideoCallContext);
    if (!ctx) throw new Error("useVideoCall must be used inside VideoCallProvider");
    return ctx;
}

type CallStatus = "idle" | "calling" | "in-call" | "incoming";

export function VideoCallProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<CallStatus>("idle");
    const [remoteUser, setRemoteUser] = useState<CallUser | null>(null);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [isCaller, setIsCaller] = useState(false);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [mediaError, setMediaError] = useState<string | null>(null);

    const statusRef = useRef(status);
    statusRef.current = status;

    const stopStream = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach((t) => t.stop());
            setLocalStream(null);
        }
    }, [localStream]);

    const stopStreamRef = useRef(stopStream);
    stopStreamRef.current = stopStream;

    useEffect(() => {
        const socket = getSocket();

        const handleIncomingCall = (data: { from: { id: string; name: string; image: string | null }; conversationId: string }) => {
            if (statusRef.current !== "idle") return;
            setRemoteUser(data.from);
            setConversationId(data.conversationId);
            setIsCaller(false);
            setStatus("incoming");
        };

        const handleCallAccepted = () => {
            if (statusRef.current === "calling") {
                setStatus("in-call");
            }
        };

        const handleCallEnded = () => {
            stopStreamRef.current();
            setStatus("idle");
            setRemoteUser(null);
            setConversationId(null);
            setIsCaller(false);
        };

        socket.on("video:incoming-call", handleIncomingCall);
        socket.on("video:call-accepted", handleCallAccepted);
        socket.on("video:call-ended", handleCallEnded);

        return () => {
            socket.off("video:incoming-call", handleIncomingCall);
            socket.off("video:call-accepted", handleCallAccepted);
            socket.off("video:call-ended", handleCallEnded);
        };
    }, []);

    const startCall = useCallback(async (user: CallUser, convId: string) => {
        setMediaError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(stream);
            const socket = getSocket();
            socket.emit("video:call-user", { to: user.id, conversationId: convId });
            setRemoteUser(user);
            setConversationId(convId);
            setIsCaller(true);
            setStatus("calling");
        } catch {
            setMediaError("Could not access camera or microphone. Please check your permissions.");
        }
    }, []);

    const dismissError = useCallback(() => {
        setMediaError(null);
        stopStream();
        setStatus("idle");
        setRemoteUser(null);
        setConversationId(null);
        setIsCaller(false);
    }, [stopStream]);

    const endCall = useCallback(() => {
        stopStream();
        setStatus("idle");
        setRemoteUser(null);
        setConversationId(null);
        setIsCaller(false);
    }, [stopStream]);

    const acceptCall = useCallback(async () => {
        if (!remoteUser || !conversationId) return;
        setMediaError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true,
            });
            setLocalStream(stream);
            const socket = getSocket();
            socket.emit("video:accept-call", { to: remoteUser.id, conversationId });
            setStatus("in-call");
        } catch {
            setMediaError("Could not access camera or microphone. Please check your permissions.");
            setStatus("idle");
            setRemoteUser(null);
            setConversationId(null);
            setIsCaller(false);
        }
    }, [remoteUser, conversationId]);

    const rejectCall = useCallback(() => {
        if (!remoteUser) return;
        const socket = getSocket();
        socket.emit("video:reject-call", { to: remoteUser.id });
        stopStream();
        setStatus("idle");
        setRemoteUser(null);
        setConversationId(null);
        setIsCaller(false);
    }, [remoteUser, stopStream]);

    return (
        <VideoCallContext.Provider
            value={{
                startCall,
                endCall,
                callState: { status, conversationId },
            }}
        >
            {children}
            {mediaError && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
                    <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-8 max-w-md text-center space-y-4">
                        <p className="text-error font-body-md">{mediaError}</p>
                        <button
                            onClick={dismissError}
                            className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
            {status === "incoming" && remoteUser && conversationId && (
                <IncomingCallDialog
                    user={remoteUser}
                    onAccept={acceptCall}
                    onReject={rejectCall}
                />
            )}
            {status === "calling" && !mediaError && remoteUser && (
                <OutgoingCallOverlay
                    user={remoteUser}
                    onCancel={endCall}
                />
            )}
            {status === "in-call" && remoteUser && conversationId && (
                <VideoCallModal
                    remoteUser={remoteUser}
                    conversationId={conversationId}
                    localStream={localStream}
                    isCaller={isCaller}
                    onClose={endCall}
                />
            )}
        </VideoCallContext.Provider>
    );
}

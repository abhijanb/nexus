import { Phone } from "lucide-react";
import { useVideoCall } from "./VideoCallProvider";

interface VideoCallButtonProps {
    otherUserId: string;
    otherUserName: string;
    otherUserImage: string | null;
    conversationId: string;
}

export function VideoCallButton({
    otherUserId,
    otherUserName,
    otherUserImage,
    conversationId,
}: VideoCallButtonProps) {
    const { startCall, callState } = useVideoCall();

    const isInCall =
        callState.status !== "idle" && callState.conversationId === conversationId;

    return (
        <button
            onClick={() =>
                startCall(
                    { id: otherUserId, name: otherUserName, image: otherUserImage },
                    conversationId
                )
            }
            disabled={isInCall}
            className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors disabled:opacity-40"
            title="Start video call"
        >
            <Phone size={18} />
        </button>
    );
}

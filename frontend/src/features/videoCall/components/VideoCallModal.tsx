import { useRef, useState, useCallback, useEffect } from "react";
import { PhoneOff, Mic, MicOff, Video, VideoOff, Monitor, MonitorOff } from "lucide-react";
import { useWebRTC } from "../hooks/useWebRTC";

interface VideoCallModalProps {
    remoteUser: { id: string; name: string; image: string | null };
    conversationId: string;
    localStream: MediaStream | null;
    isCaller: boolean;
    onClose: () => void;
}

export function VideoCallModal({
    remoteUser,
    conversationId,
    localStream,
    isCaller,
    onClose,
}: VideoCallModalProps) {
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [audioMuted, setAudioMuted] = useState(false);
    const [videoMuted, setVideoMuted] = useState(false);
    const [isSharingScreen, setIsSharingScreen] = useState(false);
    const screenStreamRef = useRef<MediaStream | null>(null);

    const handleRemoteStream = useCallback((stream: MediaStream) => {
        setRemoteStream(stream);
    }, []);

    const handleCallEnded = useCallback(() => {
        onClose();
    }, [onClose]);

    const { callStatus, endCall, replaceVideoTrack } = useWebRTC({
        remoteUserId: remoteUser.id,
        conversationId,
        localStream,
        isCaller,
        onRemoteStream: handleRemoteStream,
        onCallEnded: handleCallEnded,
    });

    const displayStream = screenStreamRef.current || localStream;

    useEffect(() => {
        if (localVideoRef.current && displayStream) {
            localVideoRef.current.srcObject = displayStream;
        }
    }, [displayStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const toggleAudio = () => {
        if (localStream) {
            localStream.getAudioTracks().forEach((t) => (t.enabled = audioMuted));
            setAudioMuted(!audioMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks().forEach((t) => (t.enabled = videoMuted));
            setVideoMuted(!videoMuted);
        }
    };

    const toggleScreenShare = useCallback(async () => {
        if (isSharingScreen) {
            if (screenStreamRef.current) {
                screenStreamRef.current.getTracks().forEach((t) => t.stop());
                screenStreamRef.current = null;
            }
            setIsSharingScreen(false);
            const cameraTrack = localStream?.getVideoTracks()[0] ?? null;
            replaceVideoTrack(cameraTrack);
        } else {
            try {
                const displayStream = await navigator.mediaDevices.getDisplayMedia({
                    video: true,
                    audio: false,
                });
                const screenTrack = displayStream.getVideoTracks()[0];
                screenTrack.onended = () => {
                    screenStreamRef.current = null;
                    setIsSharingScreen(false);
                    const cameraTrack = localStream?.getVideoTracks()[0] ?? null;
                    replaceVideoTrack(cameraTrack);
                };
                replaceVideoTrack(screenTrack);
                screenStreamRef.current = displayStream;
                setIsSharingScreen(true);
            } catch {
                // user cancelled the screen picker
            }
        }
    }, [isSharingScreen, localStream, replaceVideoTrack]);

    const handleEndCall = () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
        }
        endCall();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col overflow-hidden">
            <div className="flex-1 relative min-h-0">
                {remoteStream ? (
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-contain object-[center_60%]"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-center space-y-4">
                            <div className="w-24 h-24 rounded-full bg-surface-container-higher mx-auto overflow-hidden">
                                {remoteUser.image ? (
                                    <img src={remoteUser.image} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-on-surface-variant bg-surface-variant">
                                        {remoteUser.name.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <p className="text-xl font-bold text-white">{remoteUser.name}</p>
                            <p className="text-sm text-white/60">
                                {callStatus === "connecting"
                                    ? isCaller
                                        ? "Calling..."
                                        : "Connecting..."
                                    : "Connected"}
                            </p>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-4 right-4 w-48 h-36 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg bg-black">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover -scale-x-100"
                    />
                </div>
            </div>

            <div className="h-24 bg-black/80 flex items-center justify-center gap-6 px-6">
                <button
                    onClick={toggleAudio}
                    className={`p-4 rounded-full transition-colors ${
                        audioMuted
                            ? "bg-error-container text-on-error-container"
                            : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                >
                    {audioMuted ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
                <button
                    onClick={handleEndCall}
                    className="p-4 rounded-full bg-error text-white hover:opacity-90 transition-opacity"
                >
                    <PhoneOff size={22} />
                </button>
                <button
                    onClick={toggleVideo}
                    className={`p-4 rounded-full transition-colors ${
                        videoMuted
                            ? "bg-error-container text-on-error-container"
                            : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                >
                    {videoMuted ? <VideoOff size={22} /> : <Video size={22} />}
                </button>
                <button
                    onClick={toggleScreenShare}
                    className={`p-4 rounded-full transition-colors ${
                        isSharingScreen
                            ? "bg-tertiary-container text-on-tertiary-container"
                            : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                >
                    {isSharingScreen ? <MonitorOff size={22} /> : <Monitor size={22} />}
                </button>
            </div>
        </div>
    );
}

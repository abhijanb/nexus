import { useEffect, useRef, useCallback, useState } from "react";
import { getSocket } from "../../../shared/lib/socket";

const ICE_SERVERS: RTCConfiguration = {
    iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
    ],
};

export function useWebRTC({
    remoteUserId,
    conversationId,
    localStream,
    isCaller,
    onRemoteStream,
    onCallEnded,
}: {
    remoteUserId: string;
    conversationId: string;
    localStream: MediaStream | null;
    isCaller: boolean;
    onRemoteStream: (stream: MediaStream) => void;
    onCallEnded: () => void;
}) {
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const videoSenderRef = useRef<RTCRtpSender | null>(null);
    const [callStatus, setCallStatus] = useState<"connecting" | "connected" | "ended">("connecting");

    const cleanup = useCallback(() => {
        if (pcRef.current) {
            pcRef.current.close();
            pcRef.current = null;
        }
        setCallStatus("ended");
    }, []);

    useEffect(() => {
        if (!localStream) return;

        const stream = localStream!;
        const socket = getSocket();
        let pendingCandidates: RTCIceCandidateInit[] = [];
        let cancelled = false;

        async function start() {
            try {
                const pc = new RTCPeerConnection(ICE_SERVERS);
                pcRef.current = pc;

                stream.getTracks().forEach((track) => {
                    const sender = pc.addTrack(track, stream);
                    if (track.kind === "video") {
                        videoSenderRef.current = sender;
                    }
                });

                pc.onicecandidate = (e) => {
                    if (e.candidate) {
                        socket.emit("video:ice-candidate", {
                            to: remoteUserId,
                            candidate: e.candidate.toJSON(),
                        });
                    }
                };

                pc.ontrack = (e) => {
                    const remoteStream = e.streams[0];
                    onRemoteStream(remoteStream);
                };

                pc.oniceconnectionstatechange = () => {
                    if (
                        pc.iceConnectionState === "disconnected" ||
                        pc.iceConnectionState === "failed" ||
                        pc.iceConnectionState === "closed"
                    ) {
                        cleanup();
                        onCallEnded();
                    }
                };

                if (isCaller) {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    if (cancelled) return;
                    socket.emit("video:offer", {
                        to: remoteUserId,
                        offer: offer,
                    });
                }

                setCallStatus("connecting");

                for (const c of pendingCandidates) {
                    await pc.addIceCandidate(new RTCIceCandidate(c));
                }
                pendingCandidates = [];
            } catch {
                cleanup();
                onCallEnded();
            }
        }

        start();

        const handleOffer = async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
            if (data.from !== remoteUserId) return;
            if (!pcRef.current) return;
            try {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await pcRef.current.createAnswer();
                await pcRef.current.setLocalDescription(answer);
                socket.emit("video:answer", {
                    to: remoteUserId,
                    answer: answer,
                });
            } catch {
                cleanup();
                onCallEnded();
            }
        };

        const handleAnswer = async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
            if (data.from !== remoteUserId) return;
            if (!pcRef.current) return;
            try {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                setCallStatus("connected");
            } catch {
                cleanup();
                onCallEnded();
            }
        };

        const handleICECandidate = async (data: { from: string; candidate: RTCIceCandidateInit }) => {
            if (data.from !== remoteUserId) return;
            if (!pcRef.current) {
                pendingCandidates.push(data.candidate);
                return;
            }
            try {
                await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            } catch {
                // ignore invalid candidates
            }
        };

        socket.on("video:offer", handleOffer);
        socket.on("video:answer", handleAnswer);
        socket.on("video:ice-candidate", handleICECandidate);

        return () => {
            cancelled = true;
            socket.off("video:offer", handleOffer);
            socket.off("video:answer", handleAnswer);
            socket.off("video:ice-candidate", handleICECandidate);
            cleanup();
        };
    }, [remoteUserId, conversationId, localStream, isCaller, cleanup, onRemoteStream, onCallEnded]);

    const replaceVideoTrack = useCallback((track: MediaStreamTrack | null) => {
        if (videoSenderRef.current) {
            videoSenderRef.current.replaceTrack(track).catch(console.error);
        }
    }, []);

    const endCall = useCallback(() => {
        const socket = getSocket();
        socket.emit("video:end-call", { to: remoteUserId });
        cleanup();
        onCallEnded();
    }, [remoteUserId, cleanup, onCallEnded]);

    return { callStatus, endCall, replaceVideoTrack };
}

import { Phone, PhoneOff } from "lucide-react";

interface IncomingCallDialogProps {
    user: { id: string; name: string; image: string | null };
    onAccept: () => void;
    onReject: () => void;
}

export function IncomingCallDialog({ user, onAccept, onReject }: IncomingCallDialogProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-surface-container-high border border-outline-variant rounded-2xl p-8 w-80 shadow-2xl text-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-surface-container-higher mx-auto overflow-hidden">
                    {user.image ? (
                        <img src={user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-on-surface-variant bg-surface-variant">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div>
                    <p className="font-bold text-lg text-on-surface">{user.name}</p>
                    <p className="text-sm text-on-surface-variant mt-1">Incoming video call...</p>
                </div>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={onReject}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-error-container text-on-error-container hover:opacity-90 transition-opacity font-medium"
                    >
                        <PhoneOff size={18} />
                        Decline
                    </button>
                    <button
                        onClick={onAccept}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary-container text-on-secondary-container hover:opacity-90 transition-opacity font-medium"
                    >
                        <Phone size={18} />
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
}

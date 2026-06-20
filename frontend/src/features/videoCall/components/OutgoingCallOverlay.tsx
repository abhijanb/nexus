import { PhoneOff } from "lucide-react";

interface OutgoingCallOverlayProps {
    user: { id: string; name: string; image: string | null };
    onCancel: () => void;
}

export function OutgoingCallOverlay({ user, onCancel }: OutgoingCallOverlayProps) {
    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center gap-6">
            <div className="w-24 h-24 rounded-full overflow-hidden">
                {user.image ? (
                    <img src={user.image} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-white bg-white/10">
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                )}
            </div>
            <p className="text-xl font-bold text-white">{user.name}</p>
            <p className="text-sm text-white/60">Calling...</p>
            <span className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
            <button
                onClick={onCancel}
                className="p-4 rounded-full bg-error text-white hover:opacity-90 transition-opacity mt-4"
            >
                <PhoneOff size={22} />
            </button>
        </div>
    );
}

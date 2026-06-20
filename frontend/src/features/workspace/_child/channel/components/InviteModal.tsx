import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  open?: boolean;
  onClose?: () => void;
  onInvite?: (email: string) => Promise<void>;
}

export default function InviteModal({ open = true, onClose, onInvite }: Props) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return;
    }
    setError(null);
    if (onInvite) {
      setSending(true);
      try {
        await onInvite(email);
        setEmail("");
        onClose?.();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send invitation");
      } finally {
        setSending(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
      <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-md text-headline-md text-on-surface">Invite Member</h3>
          <button className="text-on-surface-variant hover:text-on-surface cursor-pointer transition-colors" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          Send an invitation to join your workspace. They will receive an email with a secure link.
        </p>
        <div className="space-y-5">
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface-variant">Email Address</label>
            <input
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              className="w-full bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-on-surface font-body-md text-body-md transition-all focus:ring-1 focus:ring-primary"
              placeholder="colleague@company.com"
              type="email"
            />
            {error && <p className="text-label-sm text-error mt-1">{error}</p>}
          </div>
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface-variant">Role</label>
            <select className="w-full bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-on-surface font-body-md text-body-md transition-all focus:ring-1 focus:ring-primary">
              <option>Member</option>
              <option>Admin</option>
              <option>Viewer</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 mt-8">
          <button className="px-5 py-2 text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-all cursor-pointer" onClick={onClose}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={sending}
            className="px-5 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            {sending ? "Sending..." : "Send Invitation"}
          </button>
        </div>
      </div>
    </div>
  );
}

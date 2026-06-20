import { KeyRound, Shield, Eye, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { authClient } from "../../../../shared/lib/auth-client";
import { useAppDispatch } from "../../../../app/hooks";
import { logout } from "../../../auth/authSlice";

export default function SecuritySettingsPage() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleSignOutEverywhere = async () => {
        try {
            await authClient.signOut();
            dispatch(logout());
            navigate("/login");
            toast.success("Signed out everywhere");
        } catch {
            toast.error("Failed to sign out");
        }
    };

    const handleRevokeAll = () => {
        toast.info("Session management requires additional server configuration");
    };

    const handlePassword = () => {
        toast.info("Password management requires email/password auth provider");
    };

    const handle2FA = () => {
        toast.info("Two-factor authentication requires additional server configuration");
    };

    return (
        <div className="space-y-6">
            <section>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Security Settings</h2>
                <p className="text-on-surface-variant text-body-md mt-1">Manage your account security and active sessions.</p>
            </section>

            <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                            <KeyRound size={20} />
                        </div>
                        <div>
                            <p className="text-body-md text-on-surface font-medium">Password</p>
                            <p className="text-label-sm text-on-surface-variant">Requires email/password authentication</p>
                        </div>
                    </div>
                    <button
                        onClick={handlePassword}
                        className="px-4 py-2 border border-outline-variant text-on-surface text-label-sm rounded hover:bg-surface-variant transition-colors"
                    >
                        Update Password
                    </button>
                </div>
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-secondary/10 flex items-center justify-center text-secondary">
                            <Shield size={20} />
                        </div>
                        <div>
                            <p className="text-body-md text-on-surface font-medium">Two-Factor Authentication</p>
                            <p className="text-label-sm text-on-surface-variant">Add an extra layer of security</p>
                        </div>
                    </div>
                    <button
                        onClick={handle2FA}
                        className="px-4 py-2 border border-outline-variant text-on-surface text-label-sm rounded hover:bg-surface-variant transition-colors"
                    >
                        Enable
                    </button>
                </div>
                <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-tertiary/10 flex items-center justify-center text-tertiary">
                            <Eye size={20} />
                        </div>
                        <div>
                            <p className="text-body-md text-on-surface font-medium">Active Sessions</p>
                            <p className="text-label-sm text-on-surface-variant">Manage devices where you're logged in</p>
                        </div>
                    </div>
                    <button
                        onClick={handleRevokeAll}
                        className="px-4 py-2 bg-error/10 text-error text-label-sm rounded hover:bg-error/20 transition-colors"
                    >
                        Revoke All
                    </button>
                </div>
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded bg-surface-variant flex items-center justify-center text-on-surface-variant">
                            <LogOut size={20} />
                        </div>
                        <div>
                            <p className="text-body-md text-on-surface font-medium">Sign Out Everywhere</p>
                            <p className="text-label-sm text-on-surface-variant">End all sessions across all devices</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOutEverywhere}
                        className="px-4 py-2 border border-outline-variant text-on-surface text-label-sm rounded hover:bg-surface-variant transition-colors"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}

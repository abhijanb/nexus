import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { useUpdateProfileMutation } from "../../../workspace/workspaceApi";
import { useAppSelector } from "../../../../app/hooks";

export default function AccountPage() {
    const user = useAppSelector((s) => s.auth.user);
    const [fullName, setFullName] = useState(user?.name ?? "");
    const [saved, setSaved] = useState(false);
    const [updateProfile] = useUpdateProfileMutation();

    const handleSave = async () => {
        try {
            await updateProfile({ name: fullName }).unwrap();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch {
            // silently fail
        }
    };

    return (
        <div className="space-y-6">
            <header className="mb-6">
                <h2 className="font-headline-lg text-headline-lg text-on-surface">Account Settings</h2>
                <p className="text-body-md text-on-surface-variant">Manage your technical identity and security preferences.</p>
            </header>

            <section className="bg-surface-container border border-outline-variant rounded-xl overflow-hidden">
                <div className="px-6 py-3 bg-surface-container-high border-b border-outline-variant flex justify-between items-center">
                    <h3 className="text-label-md uppercase tracking-wider font-bold">Profile Identity</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-[120px_1fr] gap-6">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-24 h-24 rounded-lg border-2 border-primary-container bg-surface-container-highest flex items-center justify-center text-3xl font-bold text-on-surface-variant">
                            {fullName.charAt(0).toUpperCase()}
                        </div>
                        <button className="text-label-sm text-primary hover:underline">Change Avatar</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-label-sm text-on-surface-variant">Username</label>
                            <div className="bg-surface-container-lowest border border-outline-variant p-2 text-code-md rounded font-code-md text-on-surface-variant">
                                {user?.email?.split("@")[0] ?? "user"}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-label-sm text-on-surface-variant">Full Name</label>
                            <input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-surface-container-lowest border border-outline-variant p-2 text-body-md rounded focus:ring-primary focus:border-primary"
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-label-sm text-on-surface-variant">Primary Email</label>
                            <div className="flex items-center gap-3">
                                <input
                                    value={user?.email ?? ""}
                                    readOnly
                                    className="flex-1 bg-surface-container-lowest border border-outline-variant p-2 text-body-md rounded text-on-surface-variant"
                                />
                                <span className="flex items-center gap-1 px-2 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded text-label-sm whitespace-nowrap">
                                    <CheckCircle size={14} />
                                    Verified
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-6 py-4 border-t border-outline-variant flex justify-end gap-3">
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-primary text-on-primary font-bold rounded hover:opacity-90 transition-all text-sm"
                    >
                        {saved ? "Saved!" : "Save Changes"}
                    </button>
                </div>
            </section>
        </div>
    );
}

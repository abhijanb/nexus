import { useState } from "react";
import { useUpdateProfileMutation } from "../../../workspace/workspaceApi";
import { useAppSelector } from "../../../../app/hooks";

export default function ProfilePage() {
  const user = useAppSelector((s) => s.auth.user);
  const [name, setName] = useState(user?.name ?? "");
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [updateProfile] = useUpdateProfileMutation();

  const handleSave = async () => {
    setSaveError(null);
    try {
      await updateProfile({ name }).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setSaveError("Failed to save profile");
    }
  };

  return (
    <>
      <section>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Profile Identity</h2>
        <p className="text-on-surface-variant text-body-md mt-1">Manage how you appear to others in the Nexus ecosystem.</p>
      </section>

      <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center gap-4 shrink-0">
            <div className="relative w-32 h-32 rounded-full border-2 border-primary p-1">
              <div className="w-full h-full rounded-full bg-surface-container-highest flex items-center justify-center text-3xl font-bold text-on-surface-variant">
                {name.charAt(0).toUpperCase()}
              </div>
            </div>
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">Avatar</span>
          </div>
          <div className="flex-1 w-full space-y-6">
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface border border-outline-variant px-4 py-2 rounded text-on-surface text-body-md transition-all focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-label-md text-on-surface-variant">Email</label>
              <input
                value={user?.email ?? ""}
                readOnly
                className="w-full bg-surface border border-outline-variant px-4 py-2 rounded text-on-surface-variant text-body-md"
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="pt-10 border-t border-outline-variant flex justify-end items-center gap-6 pb-20">
        <div className="flex items-center gap-4">
          {saveError && <p className="text-label-sm text-error">{saveError}</p>}
          <button onClick={handleSave} className="px-8 py-2 bg-primary text-on-primary font-bold rounded shadow-lg shadow-primary/20 hover:opacity-90 transition-all text-sm">
            {saved ? "Saved!" : "Save Changes"}
          </button>
        </div>
      </footer>
    </>
  );
}

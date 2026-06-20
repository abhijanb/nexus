import { Bell, Mail, MessageCircle, Users } from "lucide-react";
import type { NotificationPreferences } from "../../../workspace/pages/notificationApi";
import {
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} from "../../../workspace/pages/notificationApi";

type PrefKey = keyof NotificationPreferences;

const channels: Array<{ key: PrefKey; icon: typeof Mail; label: string; desc: string }> = [
  { key: "emailNotifications", icon: Mail, label: "Email Notifications", desc: "Receive updates via email" },
  { key: "inAppNotifications", icon: MessageCircle, label: "In-App Notifications", desc: "Show notifications in-app" },
  { key: "channelInvites", icon: Users, label: "Channel Invites", desc: "Notify when invited to a channel" },
  { key: "taskAssignments", icon: Bell, label: "Task Assignments", desc: "Notify when assigned to a task" },
];

export default function NotificationsSettingsPage() {
  const { data: prefs } = useGetNotificationPreferencesQuery();
  const [updatePrefs] = useUpdateNotificationPreferencesMutation();

  const toggle = (key: PrefKey) => {
    if (!prefs) return;
    updatePrefs({ [key]: !prefs[key] });
  };

  return (
    <div className="space-y-6">
      <section>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Notification Preferences</h2>
        <p className="text-on-surface-variant text-body-md mt-1">Control how and when you receive notifications.</p>
      </section>

      <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
        {channels.map((ch) => (
          <div key={ch.label} className="flex items-center justify-between px-6 py-4 border-b border-outline-variant last:border-b-0">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                <ch.icon size={20} />
              </div>
              <div>
                <p className="text-body-md text-on-surface font-medium">{ch.label}</p>
                <p className="text-label-sm text-on-surface-variant">{ch.desc}</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={prefs?.[ch.key] ?? true}
                onChange={() => toggle(ch.key)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 rounded-full peer peer-checked:bg-primary bg-surface-variant after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { MessageCircle, CheckSquare, Folder, Hash } from "lucide-react";

const quickLinks = [
  { to: "/channels", icon: Hash, label: "Browse Channels", desc: "Join a conversation" },
  { to: "/dm", icon: MessageCircle, label: "Direct Messages", desc: "Chat with teammates" },
  { to: "/tasks", icon: CheckSquare, label: "View Tasks", desc: "Track your work" },
  { to: "/files", icon: Folder, label: "Files", desc: "Browse shared files" },
];

export default function DashboardPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center mx-auto mb-6">
          <MessageCircle size={32} className="text-on-primary-container" />
        </div>
        <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Welcome to Nexus</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">
          Select a channel from the sidebar to start chatting, or jump straight into one of your workspaces.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {quickLinks.map(({ to, icon: Icon, label, desc }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface-container-low border border-outline-variant hover:bg-surface-container-high hover:border-primary/50 transition-all group"
            >
              <Icon size={24} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="font-label-md text-label-md text-on-surface font-medium">{label}</span>
              <span className="text-label-sm text-on-surface-variant">{desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

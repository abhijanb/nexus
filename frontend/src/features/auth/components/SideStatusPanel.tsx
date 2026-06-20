import { Terminal, Cpu, Shield, Wifi } from "lucide-react";

const statusItems = [
  { label: "Core Engine", value: "ACTIVE", color: "text-secondary" },
  { label: "Auth Protocol", value: "V3.4", color: "text-secondary" },
  { label: "Encryption", value: "AES-256", color: "text-secondary" },
  { label: "Network", value: "WSS", color: "text-secondary" },
];

export default function SideStatusPanel() {
  return (
    <div className="hidden xl:flex flex-col gap-6 w-72">
      <div
        className="border border-outline-variant/30 rounded-xl p-5 bg-surface-container-lowest/50"
        style={{ backdropFilter: "blur(12px)" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Terminal size={16} className="text-primary" />
          </div>
          <div>
            <h3 className="text-label-md text-primary font-bold tracking-wider">SYSTEM STATUS</h3>
            <p className="text-label-sm text-on-surface-variant">All systems nominal</p>
          </div>
        </div>
        <div className="space-y-3">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span className="text-label-sm text-on-surface-variant">{item.label}</span>
              </div>
              <span className={`text-label-sm font-code-md ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest/50 text-center" style={{ backdropFilter: "blur(12px)" }}>
          <Cpu size={18} className="mx-auto mb-1.5 text-primary" />
          <p className="text-label-sm text-on-surface-variant">Latency</p>
          <p className="text-code-md text-secondary font-bold">12ms</p>
        </div>
        <div className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest/50 text-center" style={{ backdropFilter: "blur(12px)" }}>
          <Shield size={18} className="mx-auto mb-1.5 text-secondary" />
          <p className="text-label-sm text-on-surface-variant">Uptime</p>
          <p className="text-code-md text-secondary font-bold">99.9%</p>
        </div>
      </div>

      <div className="border border-outline-variant/30 rounded-xl p-4 bg-surface-container-lowest/50" style={{ backdropFilter: "blur(12px)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center">
            <Wifi size={14} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-label-sm text-on-surface-variant truncate">Connected as</p>
            <p className="text-code-md text-on-surface font-medium truncate">Guest Session</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
        </div>
      </div>
    </div>
  );
}

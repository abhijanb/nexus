import { Rocket, Search, Bug, BookOpen, ChevronRight } from "lucide-react";

const terminalLines = [
  { time: "[0.0001s]", text: "BOOTSTRAP: Initializing core recovery...", className: "text-on-surface" },
  { time: "[0.0142s]", text: "ERROR: Node fetch failed. Path '{{REQUEST_URI}}' is unreachable.", className: "text-error" },
  { time: "[0.0258s]", text: "WARN: Redirect table corrupted or node moved to edge server.", className: "text-on-surface" },
  { time: "[0.0391s]", text: "INFO: Attempting mission control handshake...", className: "text-primary" },
  { time: "[0.0520s]", text: "Handshake timed out. Manual override required", className: "text-on-surface-variant" },
];

const actionLinks = [
  { icon: Search, label: "Search Workspace", desc: "Find nodes by hash or tag", color: "text-secondary" },
  { icon: Bug, label: "Report Bug", desc: "Log this incident to engineering", color: "text-tertiary" },
  { icon: BookOpen, label: "Documentation", desc: "Explore the Nexus user guide", color: "text-primary" },
];

export default function NotFoundPage() {
  return (
    <main className="flex-grow flex flex-col items-center justify-center relative px-4 md:px-8 py-20">
      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        <div className="relative mb-8 text-center">
          <h1 className="font-display text-[120px] md:text-[200px] leading-none select-none text-primary opacity-90 tracking-tighter glitch">
            404
          </h1>
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-error text-on-error px-3 py-1 font-code-md text-label-sm uppercase tracking-widest rounded-sm">
            Signal Interrupted
          </div>
          <p className="font-headline-md text-headline-md text-on-surface-variant mt-4">
            Node Not Found in Nexus Cluster
          </p>
        </div>

        <div className="w-full max-w-2xl bg-surface-container-low/60 backdrop-blur-xl rounded-xl overflow-hidden border border-outline-variant/30 mb-12">
          <div className="bg-surface-container-highest px-4 py-2 flex items-center gap-2 border-b border-outline-variant/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-error/50" />
              <div className="w-3 h-3 rounded-full bg-tertiary/50" />
              <div className="w-3 h-3 rounded-full bg-secondary/50" />
            </div>
            <span className="text-label-sm font-code-md text-on-surface-variant/60 ml-2">
              nexus-system-debugger.log
            </span>
          </div>
          <div className="p-6 font-code-md text-code-md text-on-surface-variant space-y-2 leading-relaxed">
            {terminalLines.map((line, i) => (
              <div key={i} className="flex gap-4">
                <span className="text-secondary/50 shrink-0">{line.time}</span>
                <span className={line.className}>
                  {line.text}
                  {i === terminalLines.length - 1 && (
                    <span className="terminal-cursor" />
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
          <div className="group p-6 bg-surface-container-low/60 backdrop-blur-xl rounded-xl border border-primary/20 hover:border-primary/50 transition-colors flex flex-col justify-between">
            <div>
              <Rocket className="text-primary mb-4" size={32} />
              <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
                Return to Mission Control
              </h3>
              <p className="text-on-surface-variant text-body-md mb-6">
                Reconnect to the primary dashboard and resume your workflow.
              </p>
            </div>
            <a
              href="/"
              className="block w-full bg-primary text-on-primary py-3 rounded-lg font-label-md font-bold tracking-wide hover:brightness-110 transition-all text-center"
            >
              INITIALIZE RETURN
            </a>
          </div>

          <div className="flex flex-col gap-4">
            {actionLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href="#"
                  className="group flex items-center justify-between p-4 bg-surface-container-low/60 backdrop-blur-xl rounded-lg hover:bg-surface-container-high transition-colors border border-outline-variant/20"
                >
                  <div className="flex items-center gap-3">
                    <Icon className={link.color} size={20} />
                    <div>
                      <p className="text-on-surface font-label-md">{link.label}</p>
                      <p className="text-on-surface-variant text-label-sm">{link.desc}</p>
                    </div>
                  </div>
                  <ChevronRight className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" size={20} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-20 flex flex-wrap justify-center gap-8 text-on-surface-variant/40 font-code-md text-label-sm">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            SYSTEM: STABLE
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-error" />
            NODE: OFFLINE
          </div>
          <span>LATENCY: 12ms</span>
          <span>ID: NX-882-ERROR-404</span>
        </div>
      </div>
    </main>
  );
}

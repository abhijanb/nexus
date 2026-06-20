import { Terminal } from "lucide-react";

export default function LoginHeader() {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="relative mb-5">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
        <div className="relative w-16 h-16 bg-gradient-to-br from-primary to-primary-container rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 border border-primary/20">
          <Terminal className="text-on-primary" size={36} fill="currentColor" />
        </div>
      </div>
      <h1 className="font-display text-display text-on-surface tracking-tighter bg-gradient-to-r from-on-surface to-on-surface/60 bg-clip-text">
        Nexus
      </h1>
      <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-[0.25em] mt-2">Development Workspace</p>
    </div>
  );
}

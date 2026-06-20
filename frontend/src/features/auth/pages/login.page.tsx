import LoginHeader from "../components/LoginHeader";
import { GoogleLogin } from "../components/social/GoogleLogin";
import DataStream from "../components/DataStream";
import ParticleBackground from "../components/ParticleBackground";
import SideStatusPanel from "../components/SideStatusPanel";

export function Component() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <ParticleBackground />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-[160px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-[160px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full bg-primary-container/5 blur-[200px]" />
      </div>

      <div className="relative z-10 w-full flex items-center justify-center gap-16 px-8">
        <div className="w-full max-w-105]">
          <LoginHeader />

          <div className="relative group">
            <div className="absolute -inset-px rounded-xl bg-linear-to-b from-primary/40 via-secondary/20 to-primary/10 opacity-0 group-hover:opacity-100 blur-sm transition-all duration-700" />
            <div className="absolute -inset-1px rounded-xl bg-linear-to-b from-primary/20 via-transparent to-primary/5 opacity-100" />

            <div
              className="relative bg-surface-container border border-outline-variant/30 rounded-xl p-7 shadow-2xl"
              style={{ backdropFilter: "blur(40px)", background: "rgba(19, 27, 46, 0.7)" }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

              <header className="mb-6">
                <h2 className="font-headline-md text-headline-md text-primary">System Authentication</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-1">Access your workspace environment.</p>
              </header>

              <div className="space-y-4">
                <div className="flex items-center gap-3 px-4 py-3 bg-surface-container-high rounded-lg border border-outline-variant/20">
                  <div className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                  <span className="text-label-sm text-on-surface-variant">Secure connection established</span>
                </div>

                <GoogleLogin />
              </div>
            </div>
          </div>
        </div>

        <SideStatusPanel />
      </div>

      <DataStream />

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-4 text-label-sm text-outline">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Encrypted
          </span>
          <span className="w-px h-3 bg-outline-variant" />
          <span>AES-256</span>
          <span className="w-px h-3 bg-outline-variant" />
          <span>WSS</span>
        </div>
      </div>
    </div>
  );
}

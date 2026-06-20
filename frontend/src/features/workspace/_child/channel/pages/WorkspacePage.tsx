import AdminSideNav from "../components/AdminSideNav";
import AdminTopBar from "../components/AdminTopBar";
import AdminFooter from "../components/AdminFooter";
import WorkspaceForm from "../components/WorkspaceForm";
import { ShieldCheck, Globe, Clock, ArrowRight, Shield, Plus, Trash2, Info } from "lucide-react";

export default function WorkspacePage() {
  return (
    <div className="bg-background text-on-surface flex min-h-screen">
      <div className="hidden md:block">
        <AdminSideNav active="Settings" />
      </div>
      <main className="flex-1 h-screen overflow-y-auto">
        <AdminTopBar showNavLinks activeLink="Settings" />
        <div className="max-w-[900px] mx-auto px-4 md:px-8 py-6 space-y-8">
          <section>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Workspace Settings</h2>
            <p className="text-on-surface-variant font-body-md text-body-md mt-1">
              Configure your workspace identity, governance, and security protocols.
            </p>
          </section>

          <WorkspaceForm />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl space-y-5">
              <div className="flex items-center gap-3 text-secondary">
                <Globe size={20} />
                <h3 className="font-label-md text-label-md font-bold uppercase tracking-widest">Publicity</h3>
              </div>
              <p className="text-on-surface-variant font-body-md text-body-md">
                Allow external users to discover your workspace and request access.
              </p>
              <div className="flex items-center justify-between p-3 bg-surface-container-highest rounded-lg border border-outline-variant">
                <span className="font-body-md text-body-md font-medium">Public workspace</span>
                <button className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-primary-container">
                  <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-on-primary shadow ring-0 transition duration-200 ease-in-out translate-x-5" />
                </button>
              </div>
            </div>

            <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl space-y-5">
              <div className="flex items-center gap-3 text-secondary">
                <Clock size={20} />
                <h3 className="font-label-md text-label-md font-bold uppercase tracking-widest">Data Retention</h3>
              </div>
              <p className="text-on-surface-variant font-body-md text-body-md">
                Automatically purge messages and files older than the selected period.
              </p>
              <select className="w-full bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-on-surface font-body-md text-body-md focus:ring-1 focus:ring-primary">
                <option>30 days</option>
                <option>90 days</option>
                <option>365 days</option>
              </select>
            </div>
          </div>

          <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-outline-variant flex items-center gap-3">
              <ShieldCheck size={20} className="text-secondary" />
              <h3 className="font-label-md text-label-md font-bold uppercase tracking-widest">Security Protocols</h3>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                    <Shield size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-body-md text-body-md text-on-surface font-bold">Force MFA</p>
                      <span className="px-2 py-0.5 bg-error/10 text-error font-label-sm text-label-sm rounded text-[11px] font-bold uppercase tracking-wider">Critical</span>
                    </div>
                    <p className="font-label-sm text-label-sm text-secondary">Enabled</p>
                  </div>
                </div>
                <ArrowRight size={18} className="text-on-surface-variant" />
              </div>

              <div className="border-t border-outline-variant pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                      <Info size={20} />
                    </div>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface font-bold">IP Whitelist</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">2 addresses allowed</p>
                    </div>
                  </div>
                  <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer">
                    <Plus size={18} />
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between bg-surface-container-highest px-4 py-3 rounded-lg">
                    <code className="font-code-md text-code-md text-on-surface">192.168.1.1/24</code>
                    <Trash2 size={16} className="text-on-surface-variant hover:text-error cursor-pointer transition-colors" />
                  </div>
                  <div className="flex items-center justify-between bg-surface-container-highest px-4 py-3 rounded-lg">
                    <code className="font-code-md text-code-md text-on-surface">10.0.4.15</code>
                    <Trash2 size={16} className="text-on-surface-variant hover:text-error cursor-pointer transition-colors" />
                  </div>
                </div>
              </div>

              <div className="border-t border-outline-variant pt-6">
                <div className="bg-error/5 border border-error/20 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <p className="font-body-md text-body-md font-bold text-error">Danger Zone</p>
                    <p className="font-label-sm text-label-sm text-on-surface-variant">
                      Terminating your workspace will permanently delete all data. This action cannot be undone.
                    </p>
                  </div>
                  <button className="px-5 py-2 bg-error text-on-error font-label-md text-label-md rounded-lg hover:opacity-90 transition-all shrink-0">
                    Terminate Workspace
                  </button>
                </div>
              </div>
            </div>
          </div>

          <AdminFooter />
        </div>
      </main>
    </div>
  );
}

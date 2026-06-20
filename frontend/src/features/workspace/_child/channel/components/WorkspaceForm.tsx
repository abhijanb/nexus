import { Upload } from "lucide-react";

export default function WorkspaceForm() {
  return (
    <div className="bg-surface-container-low border border-outline-variant p-6 rounded-xl">
      <h3 className="font-label-md text-label-md font-bold uppercase tracking-widest text-on-surface-variant mb-5">General Identity</h3>
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-outline-variant bg-surface flex items-center justify-center group cursor-pointer hover:border-primary transition-colors">
            <Upload size={28} className="text-on-surface-variant group-hover:text-primary transition-colors" />
          </div>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Upload Logo</span>
        </div>
        <div className="flex-1 w-full space-y-5">
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface-variant">Workspace Name</label>
            <input className="w-full bg-surface border border-outline-variant px-4 py-2.5 rounded-lg text-on-surface font-body-md text-body-md transition-all focus:ring-1 focus:ring-primary" type="text" defaultValue="Project Alpha" />
          </div>
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface-variant">Custom Domain</label>
            <div className="relative flex items-center">
              <span className="absolute left-4 text-primary font-code-md text-code-md">https://</span>
              <input className="w-full bg-surface border border-outline-variant pl-20 pr-4 py-2.5 rounded-lg text-on-surface font-code-md text-code-md transition-all focus:ring-1 focus:ring-primary" type="text" defaultValue="alpha.nexus.dev" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="font-label-md text-label-md text-on-surface-variant">Description</label>
            <textarea
              className="w-full bg-surface border border-outline-variant px-4 py-3 rounded-lg text-on-surface font-body-md text-body-md resize-none transition-all focus:ring-1 focus:ring-primary"
              rows={4}
              defaultValue="Primary workspace for the Nexus engineering team."
            />
          </div>
          <button className="px-6 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

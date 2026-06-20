import { GitBranch } from "lucide-react";

export default function RepositoryPage() {
  return (
    <div className="flex-1 flex items-center justify-center text-on-surface-variant">
      <div className="text-center">
        <GitBranch size={48} className="mx-auto mb-4 opacity-30" />
        <p className="font-body-md text-body-md">Repository</p>
        <p className="text-label-sm mt-1">Repository browser coming soon</p>
      </div>
    </div>
  );
}

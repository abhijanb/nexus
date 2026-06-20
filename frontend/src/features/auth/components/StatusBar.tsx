import { Shield } from "lucide-react";

export default function StatusBar() {
  return (
    <div className="mt-12 flex justify-center gap-6">
      <div className="flex items-center gap-1 text-label-sm font-label-sm text-outline">
        <span className="w-2 h-2 rounded-full bg-secondary" />
        <span>All systems operational</span>
      </div>
      <div className="flex items-center gap-1 text-label-sm font-label-sm text-outline">
        <Shield size={14} />
        <span>v2.4.0-stable</span>
      </div>
    </div>
  );
}

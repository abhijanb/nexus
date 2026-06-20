export default function AdminFooter() {
  return (
    <footer className="pt-6 pb-20 border-t border-outline-variant flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="font-label-sm text-label-sm text-on-surface-variant">
        &copy; 2025 Nexus Technologies. All rights reserved.
      </p>
      <div className="flex items-center gap-6">
        <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Privacy</a>
        <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors" href="#">Terms</a>
        <span className="flex items-center gap-1.5 font-label-sm text-label-sm text-secondary">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
          API Status
        </span>
      </div>
    </footer>
  );
}

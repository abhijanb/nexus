import { useEffect, useRef } from "react";
import { getShortcutsByCategory, formatShortcut } from "../lib/shortcuts";

interface ShortcutsHelpProps {
  open: boolean;
  onClose: () => void;
}

export function ShortcutsHelp({ open, onClose }: ShortcutsHelpProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const categories = getShortcutsByCategory();

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        ref={panelRef}
        className="relative w-full max-w-lg mx-4 bg-surface-container-high border border-outline-variant rounded-xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-on-surface">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors"
          >
            <span className="text-label-sm">&times;</span>
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-6">
          {Object.entries(categories).map(([category, shortcuts]) => (
            <div key={category}>
              <h3 className="font-label-md text-label-md text-primary uppercase tracking-wider mb-3">{category}</h3>
              <div className="space-y-2">
                {shortcuts.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="font-body-md text-body-md text-on-surface">{s.description}</span>
                    <kbd className="px-2 py-1 bg-surface border border-outline-variant rounded text-[11px] text-on-surface-variant font-label-sm whitespace-nowrap">
                      {formatShortcut(s)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

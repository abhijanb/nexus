import { useEffect, useRef } from "react";

export interface ShortcutDef {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  meta?: boolean;
  handler: () => void;
  description: string;
  category?: string;
  always?: boolean;
}

export function useKeyboardShortcuts(
  shortcuts: ShortcutDef[],
  enabled: boolean = true,
) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const s of shortcutsRef.current) {
        const ctrlOrMeta = s.ctrl || s.meta;
        const modMatch = ctrlOrMeta ? (e.ctrlKey || e.metaKey) : !e.ctrlKey && !e.metaKey;
        const shiftMatch = s.shift ? e.shiftKey : !e.shiftKey;
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase();

        if (!(modMatch && shiftMatch && keyMatch)) continue;

        const tag = (e.target as HTMLElement).tagName;
        const isEditable = tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement)?.isContentEditable;
        if (isEditable && !s.always) continue;

        e.preventDefault();
        e.stopPropagation();
        s.handler();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled]);
}

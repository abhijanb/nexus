export interface ShortcutMeta {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  description: string;
  category: string;
  always?: boolean;
}

export const SHORTCUTS: ShortcutMeta[] = [
  { key: "k", ctrl: true, description: "Command palette", category: "General", always: true },
  { key: "n", ctrl: true, description: "New message", category: "Navigation", always: true },
  { key: "1", ctrl: true, description: "Go to Channels", category: "Navigation" },
  { key: "2", ctrl: true, description: "Go to Direct Messages", category: "Navigation" },
  { key: "3", ctrl: true, description: "Go to Friends", category: "Navigation" },
  { key: "4", ctrl: true, description: "Go to Tasks", category: "Navigation" },
  { key: "5", ctrl: true, description: "Go to Files", category: "Navigation" },
  { key: ",", ctrl: true, description: "Go to Settings", category: "Navigation", always: true },
  { key: "n", ctrl: true, shift: true, description: "Go to Notifications", category: "Navigation" },
  { key: "/", description: "Focus search", category: "General", always: true },
  { key: "Escape", description: "Close sidebar / modals", category: "General", always: true },
  { key: "?", description: "Show keyboard shortcuts", category: "General" },
];

export function formatShortcut(meta: ShortcutMeta): string {
  const parts: string[] = [];
  if (meta.ctrl) parts.push("Ctrl");
  if (meta.shift) parts.push("Shift");
  parts.push(meta.key === "," ? "," : meta.key === " " ? "Space" : meta.key === "Escape" ? "Esc" : meta.key.toUpperCase());
  return parts.join(" + ");
}

export function getShortcutsByCategory(): Record<string, ShortcutMeta[]> {
  const map: Record<string, ShortcutMeta[]> = {};
  for (const s of SHORTCUTS) {
    (map[s.category] ??= []).push(s);
  }
  return map;
}

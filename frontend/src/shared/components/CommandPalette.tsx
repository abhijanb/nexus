import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Hash, MessageCircle, Users, CheckSquare, Folder, Settings, Bell, Home, Send, Command } from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: typeof Hash;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  navigate: ReturnType<typeof useNavigate>;
}

export function CommandPalette({ open, onClose, navigate }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commands: CommandItem[] = [
    { id: "channels", label: "Go to Channels", icon: Hash, action: () => navigate("/channels") },
    { id: "dm", label: "Go to Direct Messages", icon: MessageCircle, action: () => navigate("/dm") },
    { id: "new-message", label: "New Message", description: "Start a new conversation", icon: Send, action: () => navigate("/dm") },
    { id: "friends", label: "Go to Friends", icon: Users, action: () => navigate("/friends") },
    { id: "tasks", label: "Go to Tasks", icon: CheckSquare, action: () => navigate("/tasks") },
    { id: "files", label: "Go to Files", icon: Folder, action: () => navigate("/files") },
    { id: "settings", label: "Go to Settings", icon: Settings, action: () => navigate("/settings") },
    { id: "notifications", label: "Go to Notifications", icon: Bell, action: () => navigate("/notifications") },
    { id: "home", label: "Go to Home", icon: Home, action: () => navigate("/") },
  ];

  const filtered = query.trim()
    ? commands.filter((c) =>
        c.label.toLowerCase().includes(query.toLowerCase()),
      )
    : commands;

  useEffect(() => {
    if (open) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filtered.length]);

  const execute = useCallback(
    (item: CommandItem) => {
      item.action();
      onClose();
    },
    [onClose],
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[selectedIndex]) {
      e.preventDefault();
      execute(filtered[selectedIndex]);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView?.({ block: "nearest" });
  }, [selectedIndex, open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-full max-w-lg bg-surface-container-high border border-outline-variant rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-outline-variant">
          <Search size={18} className="text-on-surface-variant shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or page name..."
            className="flex-1 bg-transparent border-none text-body-lg font-body-md text-on-surface placeholder:text-on-surface-variant outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-surface border border-outline-variant rounded text-[10px] text-on-surface-variant font-label-sm">
            <Command size={10} />
            K
          </kbd>
        </div>
        <div ref={listRef} className="max-h-80 overflow-y-auto py-2" role="listbox">
          {filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-on-surface-variant text-body-md">
              No results for "{query}"
            </div>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  role="option"
                  aria-selected={i === selectedIndex}
                  onClick={() => execute(cmd)}
                  onMouseEnter={() => setSelectedIndex(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    i === selectedIndex
                      ? "bg-primary-container/30 text-on-surface"
                      : "text-on-surface-variant hover:bg-surface-container"
                  }`}
                >
                  <Icon size={18} className="shrink-0 opacity-70" />
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-md text-body-md truncate">{cmd.label}</span>
                    {cmd.description && (
                      <span className="font-label-sm text-label-sm text-on-surface-variant truncate">{cmd.description}</span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
        <div className="flex items-center gap-4 px-4 py-2 border-t border-outline-variant bg-surface-container">
          <span className="flex items-center gap-1 text-[10px] text-on-surface-variant">
            <kbd className="px-1 py-0.5 bg-surface border border-outline-variant rounded text-[9px]">↑↓</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1 text-[10px] text-on-surface-variant">
            <kbd className="px-1 py-0.5 bg-surface border border-outline-variant rounded text-[9px]">↵</kbd>
            Select
          </span>
          <span className="flex items-center gap-1 text-[10px] text-on-surface-variant">
            <kbd className="px-1 py-0.5 bg-surface border border-outline-variant rounded text-[9px]">Esc</kbd>
            Close
          </span>
        </div>
      </div>
    </div>
  );
}

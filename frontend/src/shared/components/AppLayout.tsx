import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";
import { Search, Bell, Settings, Menu } from "lucide-react";
import { toast } from "sonner";
import { getSocket } from "../lib/socket";
import { Sidebar } from "./Sidebar";
import { CommandPalette } from "./CommandPalette";
import { ShortcutsHelp } from "./ShortcutsHelp";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { userOnline, userOffline } from "../../features/presence/presenceSlice";
import { setTyping } from "../../features/typing/typingSlice";
import { VideoCallProvider } from "../../features/videoCall";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";
import { SHORTCUTS } from "../lib/shortcuts";
import { setupIdleDisconnect } from "../lib/socket";

const NAV_SHORTCUTS: Record<string, string> = {
    "1": "/channels",
    "2": "/dm",
    "3": "/friends",
    "4": "/tasks",
    "5": "/files",
};

export function AppLayout() {
    const dispatch = useAppDispatch();
    const { user, isAuthenticated } = useAppSelector((s) => s.auth);
    const navigate = useNavigate();
    const searchRef = useRef<HTMLInputElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) return;
        const socket = getSocket();
        socket.on("user:online", (data) => dispatch(userOnline(data.userId)));
        socket.on("user:offline", (data) => dispatch(userOffline(data.userId)));
        socket.on("typing:status", (data) => {
            const key = data.channelId ?? data.conversationId;
            if (!key) return;
            dispatch(setTyping({ key, userId: data.userId, userName: data.userName, isTyping: data.isTyping }));
        });
        socket.on("notification:created", (data) => {
            toast(data.title, {
                description: data.body,
                action: data.link ? { label: "View", onClick: () => navigate(data.link!) } : undefined,
            });
        });
        const cleanupIdle = setupIdleDisconnect();
        return () => {
            socket.off("user:online");
            socket.off("user:offline");
            socket.off("typing:status");
            socket.off("notification:created");
            cleanupIdle();
        };
    }, [isAuthenticated, dispatch]);

    const closeAll = useCallback(() => {
        setCommandPaletteOpen(false);
        setShortcutsHelpOpen(false);
        setSidebarOpen(false);
    }, []);

    useKeyboardShortcuts(
        [
            ...SHORTCUTS.map((s) => {
                let handler: () => void;
                if (s.key === "k" && s.ctrl) {
                    handler = () => { closeAll(); setCommandPaletteOpen(true); };
                } else if (s.key === "n" && s.ctrl && !s.shift) {
                    handler = () => navigate("/dm");
                } else if (s.key === "n" && s.ctrl && s.shift) {
                    handler = () => navigate("/notifications");
                } else if (s.key === "," && s.ctrl) {
                    handler = () => navigate("/settings");
                } else if (s.key === "Escape") {
                    handler = () => {
                        if (sidebarOpen) { setSidebarOpen(false); return; }
                        if (commandPaletteOpen) { setCommandPaletteOpen(false); return; }
                        if (shortcutsHelpOpen) { setShortcutsHelpOpen(false); return; }
                    };
                } else if (s.key === "?") {
                    handler = () => { closeAll(); setShortcutsHelpOpen(true); };
                } else if (s.key === "/") {
                    handler = () => searchRef.current?.focus();
                } else if (NAV_SHORTCUTS[s.key] && s.ctrl) {
                    const path = NAV_SHORTCUTS[s.key];
                    handler = () => navigate(path);
                } else {
                    handler = () => {};
                }
                return { ...s, handler };
            }),
        ],
        isAuthenticated,
    );

    if (!isAuthenticated) {
        return null;
    }

    const userName = user?.name ?? "User";
    const userImage = user?.image ?? "";

    return (
        <div className="flex h-screen overflow-hidden bg-background text-on-background">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <main className="flex-1 flex flex-col min-w-0 md:ml-0">
                <header className="h-16 bg-surface flex items-center justify-between px-4 md:px-8 border-b border-outline-variant flex-shrink-0 gap-4">
                    <div className="flex items-center gap-3 md:gap-6 min-w-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="md:hidden p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors shrink-0"
                            aria-label="Open sidebar"
                        >
                            <Menu size={20} />
                        </button>
                        <div className="relative flex-1 min-w-0 max-w-xs md:max-w-64">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                            <input
                                ref={searchRef}
                                className="bg-surface-container-high border-none rounded-lg pl-10 pr-4 py-2 text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant focus:ring-2 focus:ring-primary w-full"
                                placeholder="Search for tasks... (Ctrl+K for commands)"
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && searchQuery.trim()) {
                                        navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 md:gap-4 shrink-0">
                        <div className="flex items-center gap-1 md:gap-2 mr-0 md:mr-4">
                            <NavLink to="/notifications" className={({ isActive }) => cn("p-2 rounded-full transition-colors", isActive ? "bg-surface-container-high text-primary" : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary")}>
                                <Bell size={20} />
                            </NavLink>
                            <NavLink to="/settings" className={({ isActive }) => cn("p-2 rounded-full transition-colors", isActive ? "bg-surface-container-high text-primary" : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary")}>
                                <Settings size={20} />
                            </NavLink>
                        </div>
                        <div className="flex items-center gap-2 border-l border-outline-variant pl-2 md:pl-4">
                            <div className="hidden sm:block text-right">
                                <p className="font-label-md text-label-md text-on-surface font-bold">{userName}</p>
                                <p className="hidden md:block font-label-sm text-label-sm text-on-surface-variant">Developer</p>
                            </div>
                            {userImage ? (
                                <img alt={userName} className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-primary/20 object-cover" src={userImage} />
                            ) : (
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-bold text-sm border border-primary/20">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto">
                    <VideoCallProvider>
                        <Suspense fallback={
                            <div className="flex items-center justify-center h-full text-on-surface-variant font-body-md">
                                Loading...
                            </div>
                        }>
                            <Outlet />
                        </Suspense>
                    </VideoCallProvider>
                </div>
            </main>
            <CommandPalette
                open={commandPaletteOpen}
                onClose={() => setCommandPaletteOpen(false)}
                navigate={navigate}
            />
            <ShortcutsHelp
                open={shortcutsHelpOpen}
                onClose={() => setShortcutsHelpOpen(false)}
            />
        </div>
    );
}

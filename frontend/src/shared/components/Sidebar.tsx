import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";
import {
    Terminal, MessageCircle, CheckSquare, Menu, X,
    Folder, Settings, Hash, Users,
} from "lucide-react";

const mainNav = [
    { to: "/channels", icon: Hash, label: "Channels" },
    { to: "/dm", icon: MessageCircle, label: "Direct Messages" },
    { to: "/friends", icon: Users, label: "Friends" },
    { to: "/tasks", icon: CheckSquare, label: "Tasks" },
    { to: "/files", icon: Folder, label: "Files" },
];

interface SidebarProps {
    open: boolean;
    onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
    const sidebar = (
        <aside className="h-full w-64 flex flex-col bg-surface-container-low border-r border-outline-variant shrink-0">
            <div className="px-6 pt-6 pb-4 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-container rounded flex items-center justify-center">
                        <Terminal className="text-white" size={20} />
                    </div>
                        <div className="flex flex-col">
                            <span className="font-headline-md text-headline-md font-bold text-on-surface leading-none">Nexus Dev</span>
                        </div>
                </div>
            </div>

            <nav className="flex-1 flex flex-col overflow-y-auto">
                {mainNav.map(({ to, icon: Icon, label }) => (
                    <NavLink
                        key={to}
                        to={to}
                        onClick={onClose}
                        className={({ isActive }) =>
                            cn("px-4 py-3 flex items-center gap-3 border-l-4 transition-colors duration-200", isActive ? "text-primary border-primary bg-surface-container-high" : "text-on-surface-variant border-transparent hover:bg-surface-container")
                        }
                    >
                        <Icon size={20} />
                        <span className="font-body-md text-body-md">{label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto border-t border-outline-variant/30">
                <NavLink
                    to="/settings"
                    onClick={onClose}
                    className={({ isActive }) =>
                        cn("px-4 py-4 flex items-center gap-3 border-l-4 transition-colors duration-200", isActive ? "text-primary border-primary bg-surface-container-high" : "text-on-surface-variant border-transparent hover:bg-surface-container")
                    }
                >
                    <Settings size={20} />
                    <span className="font-body-md text-body-md">Settings</span>
                </NavLink>
            </div>
        </aside>
    );

    return (
        <>
            {/* Desktop sidebar — always visible */}
            <div className="hidden md:flex h-screen shrink-0">
                {sidebar}
            </div>

            {/* Mobile sidebar — overlay drawer */}
            {open && (
                <div className="fixed inset-0 z-50 md:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={onClose} />
                    <div className="absolute left-0 top-0 h-full w-64 animate-slide-in">
                        {sidebar}
                    </div>
                </div>
            )}
        </>
    );
}

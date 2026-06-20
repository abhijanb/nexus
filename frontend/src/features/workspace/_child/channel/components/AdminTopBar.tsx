import { Search, Bell, Server, UserCircle } from "lucide-react";

interface Props {
  search?: string;
  showNavLinks?: boolean;
  activeLink?: string;
}

export default function AdminTopBar({ search = "Search members, roles, or activity...", showNavLinks = false, activeLink }: Props) {
  return (
    <header className="flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant sticky top-0 z-10">
      <div className="flex items-center gap-6">
        <span className="font-headline-md text-headline-md font-bold text-primary">Nexus</span>
        {showNavLinks && (
          <div className="hidden md:flex gap-6">
            <a className="text-on-surface-variant hover:text-on-surface font-body-md text-body-md transition-colors" href="#">Dashboard</a>
            <a
              className={`font-body-md text-body-md transition-colors ${
                activeLink === "Settings" ? "text-primary underline" : "text-on-surface-variant hover:text-on-surface"
              }`}
              href="#"
            >
              Settings
            </a>
            <a className="text-on-surface-variant hover:text-on-surface font-body-md text-body-md transition-colors" href="#">Members</a>
          </div>
        )}
        {!showNavLinks && (
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
            <input
              className="bg-surface-variant border-none rounded-lg pl-10 pr-4 py-2 text-label-md font-label-md w-72 focus:ring-1 focus:ring-primary transition-all"
              placeholder={search}
              type="text"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:text-on-surface cursor-pointer active:opacity-80 transition-colors">
          <Bell size={20} />
        </button>
        <button className="text-on-surface-variant hover:text-on-surface cursor-pointer active:opacity-80 transition-colors">
          <Server size={20} />
        </button>
        <button className="w-8 h-8 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors">
          <UserCircle size={20} />
        </button>
      </div>
    </header>
  );
}

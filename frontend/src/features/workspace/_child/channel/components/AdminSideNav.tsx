import { GitBranch, LayoutDashboard, ClipboardList, Video, Settings, FileText, HelpCircle } from "lucide-react";

interface Props {
  active?: string;
}

export default function AdminSideNav({ active = "Settings" }: Props) {
  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: ClipboardList, label: "Tasks" },
    { icon: Video, label: "Meetings" },

    { icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="flex flex-col h-screen p-4 gap-4 bg-surface-container-low border-r border-outline-variant w-64 shrink-0">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary font-bold font-headline-md text-headline-md">
          PA
        </div>
        <div>
          <h1 className="font-headline-md text-headline-md text-primary leading-none">Project Alpha</h1>
          <p className="font-label-sm text-label-sm text-on-surface-variant">Engineering HQ</p>
        </div>
      </div>

      <button className="w-full py-2 px-4 bg-primary text-on-primary font-label-md text-label-md rounded-xl hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2">
        <GitBranch size={16} />
        New Branch
      </button>

      <nav className="flex flex-col gap-1 mt-2 flex-grow">
        {navItems.map(({ icon: Icon, label }) => (
          <a
            key={label}
            className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${
              active === label
                ? "bg-primary-container text-on-primary-container font-bold border-r-4 border-primary"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
            href="#"
          >
            <Icon size={20} />
            <span className="font-label-md text-label-md">{label}</span>
          </a>
        ))}
      </nav>

      <div className="flex flex-col gap-1 pt-4 border-t border-outline-variant">
        <a className="flex items-center gap-4 p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all cursor-pointer" href="#">
          <FileText size={20} />
          <span className="font-label-md text-label-md">Documentation</span>
        </a>
        <a className="flex items-center gap-4 p-3 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-all cursor-pointer" href="#">
          <HelpCircle size={20} />
          <span className="font-label-md text-label-md">Support</span>
        </a>
      </div>
    </aside>
  );
}

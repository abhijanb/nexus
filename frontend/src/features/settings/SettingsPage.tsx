import { useState, lazy, Suspense } from "react";
import { cn } from "../../shared/lib/utils";
import { sections, type SectionId } from "./constant/sections";

const ProfilePage = lazy(() => import("./_child/profile/ProfilePage"));
const AppearancePage = lazy(() => import("./_child/appearance/AppearancePage"));
const AccountPage = lazy(() => import("./_child/account/AccountPage"));
const NotificationsSettingsPage = lazy(() => import("./_child/notifications/NotificationsSettingsPage"));
const SecuritySettingsPage = lazy(() => import("./_child/security/SecuritySettingsPage"));
const CallSettingsPage = lazy(() => import("../videoCall/pages/CallSettingsPage"));

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>("profile");

  const ActiveIcon = sections.find((s) => s.id === activeSection)?.icon ?? sections[0].icon;

  return (
    <div className="flex h-full overflow-hidden bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-outline-variant bg-surface-container-low shrink-0">
        <div className="px-6 pt-6 pb-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-on-primary">
            <ActiveIcon size={18} />
          </div>
          <div>
            <h1 className="font-bold text-sm text-on-surface">Settings</h1>
            <p className="text-label-sm text-on-surface-variant">Manage your workspace</p>
          </div>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded text-left transition-all duration-200",
                activeSection === id
                  ? "bg-secondary-container text-on-secondary-container font-bold"
                  : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              )}
            >
              <Icon size={18} />
              <span className="text-label-md">{label}</span>
            </button>
          ))}
        </nav>
        <div className="px-3 mt-auto space-y-4 pb-6">
          <button
            onClick={() => alert("Upgrade options coming soon")}
            className="w-full py-2 bg-primary text-on-primary font-bold rounded hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm"
          >
            <span className="text-xs">✦</span>
            Upgrade Plan
          </button>
          <div className="pt-4 border-t border-outline-variant space-y-1">
            <a className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded transition-all text-sm" href="#">
              <span className="text-xs">📄</span>
              Documentation
            </a>
            <a className="flex items-center gap-3 px-3 py-2 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface rounded transition-all text-sm" href="#">
              <span className="text-xs">❓</span>
              Support
            </a>
          </div>
        </div>
      </aside>

      {/* Mobile tab bar */}
      <div className="md:hidden flex overflow-x-auto border-b border-outline-variant bg-surface-container-low shrink-0">
        {sections.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 whitespace-nowrap text-label-md transition-colors border-b-2",
              activeSection === id
                ? "text-primary border-primary font-bold"
                : "text-on-surface-variant border-transparent hover:text-on-surface"
            )}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[900px] mx-auto px-4 md:px-8 py-6 space-y-10">
          <Suspense fallback={<div className="text-center py-12 text-on-surface-variant font-body-md">Loading...</div>}>
            {activeSection === "profile" && <ProfilePage />}
            {activeSection === "appearance" && <AppearancePage />}
            {activeSection === "account" && <AccountPage />}
            {activeSection === "notifications" && <NotificationsSettingsPage />}
            {activeSection === "security" && <SecuritySettingsPage />}
            {activeSection === "calls" && <CallSettingsPage />}
          </Suspense>
        </div>
      </main>
    </div>
  );
}

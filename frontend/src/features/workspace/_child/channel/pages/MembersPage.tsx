import { useState } from "react";
import AdminSideNav from "../components/AdminSideNav";
import AdminTopBar from "../components/AdminTopBar";
import AdminFooter from "../components/AdminFooter";
import StatCards from "../components/StatCards";
import MemberTable from "../components/MemberTable";
import InviteModal from "../components/InviteModal";
import { Download, UserPlus } from "lucide-react";

interface StatCard {
  label: string;
  value: string;
  suffix: string;
  color?: string;
}

interface Props {
  stats?: StatCard[];
  members?: Array<{
    initials: string;
    name: string;
    email: string;
    role: "Admin" | "Member" | "Viewer";
    status: "Active" | "Invited";
    lastActivity: string;
  }>;
  memberTotal?: number;
}

export default function MembersPage({ stats = [], members = [], memberTotal }: Props) {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="bg-background text-on-surface flex min-h-screen">
      <div className="hidden md:block">
        <AdminSideNav active="Settings" />
      </div>
      <main className="flex-1 h-screen overflow-y-auto">
        <AdminTopBar search="Search members, roles, or activity..." />
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 space-y-6">
          <nav className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant mb-2">
            <a className="hover:text-on-surface transition-colors" href="#">Admin</a>
            <span>&gt;</span>
            <span className="text-on-surface">Members</span>
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Organization Members</h2>
              <p className="text-on-surface-variant font-body-md text-body-md">Manage team access and permissions</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 border border-outline-variant text-on-surface-variant hover:text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-high transition-all flex items-center gap-2">
                <Download size={16} />
                Export CSV
              </button>
              <button
                className="px-4 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
                onClick={() => setInviteOpen(true)}
              >
                <UserPlus size={16} />
                Invite Member
              </button>
            </div>
          </div>
          {stats.length > 0 && <StatCards cards={stats} />}
          <MemberTable members={members} total={memberTotal} />
          <AdminFooter />
        </div>
      </main>
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}

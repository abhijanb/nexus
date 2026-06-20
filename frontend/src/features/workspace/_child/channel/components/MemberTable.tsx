import { MoreVertical, ChevronLeft, ChevronRight, Users } from "lucide-react";

interface Member {
  avatar?: string;
  initials: string;
  name: string;
  email: string;
  role: "Admin" | "Member" | "Viewer";
  status: "Active" | "Invited";
  lastActivity: string;
}

interface Props {
  members: Member[];
  total?: number;
}

const roleStyles: Record<string, string> = {
  Admin: "bg-primary/10 text-primary",
  Member: "bg-secondary/10 text-secondary",
  Viewer: "bg-surface-container-highest text-on-surface-variant",
};

export default function MemberTable({ members, total }: Props) {
  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Member Name</th>
              <th className="text-left px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Role</th>
              <th className="text-left px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Last Activity</th>
              <th className="text-right px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {members.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-on-surface-variant">
                  <Users size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-body-md text-body-md">No members found</p>
                </td>
              </tr>
            ) : members.map(({ initials, name, email, role, status, lastActivity }) => (
              <tr key={name} className="group hover:bg-surface-container-high transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-outline-variant shrink-0">
                      <span className="font-label-sm text-label-sm font-bold text-on-surface-variant">{initials}</span>
                    </div>
                    <div>
                      <p className="font-body-md text-body-md text-on-surface">{name}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-3 py-1 rounded-lg font-label-sm text-label-sm font-medium ${roleStyles[role]}`}>
                    {role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${status === "Active" ? "bg-secondary" : "bg-warning"}`} />
                    <span className="font-body-md text-body-md text-on-surface">{status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">{lastActivity}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-on-surface-variant opacity-0 group-hover:opacity-100 hover:text-on-surface transition-all cursor-pointer">
                    <MoreVertical size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant">
        <p className="font-label-sm text-label-sm text-on-surface-variant">Showing {members.length}{total ? ` of ${total}` : ""} members</p>
        <div className="flex items-center gap-2">
          <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-all cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <button className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-all cursor-pointer">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

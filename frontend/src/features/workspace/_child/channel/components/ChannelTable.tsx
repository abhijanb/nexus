import { MoreVertical, ChevronLeft, ChevronRight, Hash } from "lucide-react";

interface Channel {
  name: string;
  type: "Public" | "Private";
  members: number;
  lastActive: string;
}

interface Props {
  channels: Channel[];
  total?: number;
}

export default function ChannelTable({ channels, total }: Props) {
  return (
    <div className="bg-surface-container-low border border-outline-variant rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-outline-variant">
              <th className="text-left px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Channel Name</th>
              <th className="text-left px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Members</th>
              <th className="text-left px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Last Active</th>
              <th className="text-right px-6 py-4 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {channels.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-on-surface-variant">
                  <Hash size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="font-body-md text-body-md">No channels found</p>
                </td>
              </tr>
            ) : channels.map(({ name, type, members, lastActive }) => (
              <tr key={name} className="group hover:bg-surface-container-high transition-colors">
                <td className="px-6 py-4">
                  <p className="font-body-md text-body-md text-on-surface">#{name}</p>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-lg font-label-sm text-label-sm font-medium ${
                      type === "Public"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-surface-container-highest text-on-surface-variant"
                    }`}
                  >
                    {type}
                  </span>
                </td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface">{members}</td>
                <td className="px-6 py-4 font-body-md text-body-md text-on-surface-variant">{lastActive}</td>
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
        <p className="font-label-sm text-label-sm text-on-surface-variant">Showing {channels.length}{total ? ` of ${total}` : ""} channels</p>
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

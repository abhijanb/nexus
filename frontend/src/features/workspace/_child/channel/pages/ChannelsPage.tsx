import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useGetChannelsQuery } from "../../../workspaceApi";
import {
  Hash, Lock, Archive, PlusCircle, Filter,
  ChevronLeft, ChevronRight, Users,
} from "lucide-react";

type FilterType = "all" | "PUBLIC" | "PRIVATE" | "ARCHIVED";

const filters: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "Public", value: "PUBLIC" },
  { label: "Private", value: "PRIVATE" },
  { label: "Archived", value: "ARCHIVED" },
];

export default function ChannelsPage() {
  const { data: channels = [], isLoading, isError } = useGetChannelsQuery();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filtered = useMemo(() => {
    return channels.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description ?? "").toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "all" ||
        (filter === "ARCHIVED" ? c.isArchived : c.type === filter && !c.isArchived);
      return matchesSearch && matchesFilter;
    });
  }, [channels, search, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  if (isLoading) {
    return (
      <div className="h-full overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-surface-container-high rounded" />
            <div className="h-4 w-96 bg-surface-container-high rounded" />
            <div className="h-12 w-full bg-surface-container-high rounded" />
            <div className="h-64 w-full bg-surface-container-high rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="h-full overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-6">
          <div className="bg-error-container/10 border border-error/30 rounded-lg p-6 text-center">
            <p className="font-body-md text-body-md text-error mb-2">Failed to load channels</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-error text-on-error rounded font-label-md text-label-md hover:opacity-90"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const visibleCount = filtered.length;

  const visibilityConfig = (channel: typeof channels[0]) => {
    if (channel.isArchived)
      return { label: "Archived", icon: Archive, className: "bg-surface-variant text-on-surface-variant border border-outline-variant" };
    if (channel.type === "PRIVATE")
      return { label: "Private", icon: Lock, className: "bg-tertiary-container/20 text-tertiary border border-tertiary/30" };
    return { label: "Public", icon: Hash, className: "bg-secondary-container/20 text-secondary border border-secondary/30" };
  };

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Channels</h2>
              <span className="px-2 py-0.5 bg-surface-container-high rounded border border-outline-variant font-code-md text-[12px] text-primary">{channels.length} TOTAL</span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">Manage communication hubs across the Nexus workspace. Organize projects, teams, and technical discussions.</p>
          </div>
          <Link
            to="/channels/create"
            className="bg-primary text-on-primary px-6 py-2.5 rounded font-label-md text-label-md font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/10"
          >
            <PlusCircle size={20} />
            Create Channel
          </Link>
        </div>

        {/* Search & Filters */}
        <div className="bg-surface-container-low border border-outline-variant rounded-lg p-2 flex flex-col lg:flex-row items-center gap-4">
          <div className="relative flex-1 w-full lg:w-auto">
            <Filter size={18} className="absolute inset-y-0 left-3 top-0 bottom-0 m-auto text-outline" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-surface-container border-none focus:ring-1 focus:ring-primary text-on-surface pl-10 pr-4 py-2 rounded font-body-md text-body-md"
              placeholder="Search channels by name or description..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => { setFilter(f.value); setPage(1); }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full font-label-md text-label-md ${
                  filter === f.value
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:text-on-surface border border-outline-variant/30"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Channel Table — desktop */}
        <div className="hidden md:block bg-surface-container border border-outline-variant rounded shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant bg-surface-container-highest/30">
                <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Channel Name</th>
                <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider hidden lg:table-cell">Description</th>
                <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-center">Members</th>
                <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Visibility</th>
                <th className="px-4 py-4 font-label-md text-label-md text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {paged.map((channel) => {
                const vis = visibilityConfig(channel);
                const VisIcon = vis.icon;
                return (
                  <tr
                    key={channel.id}
                    className="hover:bg-surface-container-high transition-all duration-200 group cursor-pointer"
                  >
                    <td className="px-4 py-5">
                      <Link to={`/channels/${channel.name}`} className="flex items-center gap-3">
                        {channel.isArchived ? (
                          <Archive size={20} className="text-outline" />
                        ) : (
                          <Hash size={20} className="text-primary" />
                        )}
                        <span className="font-bold text-on-surface font-body-lg text-body-lg">{channel.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-5 hidden lg:table-cell">
                      <p className="text-on-surface-variant font-body-md text-body-md truncate max-w-xs">
                        {channel.description ?? "No description"}
                      </p>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className="font-code-md text-code-md text-on-surface flex items-center justify-center gap-1">
                        <Users size={14} className="text-outline" /> {channel._count?.members ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight flex items-center gap-1 w-fit ${vis.className}`}>
                        <VisIcon size={12} />
                        {vis.label}
                      </span>
                    </td>
                    <td className="px-4 py-5 text-right">
                      <Link
                        to={`/channels/${channel.name}`}
                        className="bg-surface-variant text-on-surface-variant px-4 py-1.5 rounded font-label-md text-label-md font-bold group-hover:bg-primary group-hover:text-on-primary transition-all inline-block"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant">
                    <Hash size={40} className="mx-auto mb-4 opacity-30" />
                    <p className="font-body-md text-body-md">No channels found</p>
                    <p className="text-label-sm mt-1">Try adjusting your search or filters</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Channel Cards — mobile */}
        <div className="md:hidden space-y-3">
          {paged.map((channel) => {
            const vis = visibilityConfig(channel);
            const VisIcon = vis.icon;
            return (
              <Link
                key={channel.id}
                to={`/channels/${channel.name}`}
                className="block bg-surface-container border border-outline-variant rounded-lg p-4 hover:bg-surface-container-high transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {channel.isArchived ? (
                      <Archive size={18} className="text-outline shrink-0" />
                    ) : (
                      <Hash size={18} className="text-primary shrink-0" />
                    )}
                    <span className="font-bold text-on-surface text-body-lg truncate">{channel.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tight flex items-center gap-1 shrink-0 ${vis.className}`}>
                    <VisIcon size={12} />
                    {vis.label}
                  </span>
                </div>
                <p className="text-on-surface-variant font-body-md text-body-md line-clamp-2 mb-2">
                  {channel.description ?? "No description"}
                </p>
                <div className="flex items-center gap-3 text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <Users size={14} className="text-outline" /> {channel._count?.members ?? "—"}
                  </span>
                </div>
              </Link>
            );
          })}
          {paged.length === 0 && (
            <div className="text-center py-12 text-on-surface-variant">
              <Hash size={40} className="mx-auto mb-4 opacity-30" />
              <p className="font-body-md text-body-md">No channels found</p>
              <p className="text-label-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 font-label-md text-label-md text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span>Showing {Math.min(perPage, visibleCount)} of {visibleCount} channels</span>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant transition-colors disabled:opacity-40"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (
                  p === 1 ||
                  p === totalPages ||
                  (p >= page - 1 && p <= page + 1)
                ) {
                  return (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded text-sm ${
                        p === page ? "bg-primary text-on-primary" : "border border-outline-variant hover:bg-surface-variant transition-colors"
                      }`}
                    >
                      {p}
                    </button>
                  );
                }
                if (p === page - 2 || p === page + 2) {
                  return <span key={p} className="px-1">...</span>;
                }
                return null;
              })}
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant hover:bg-surface-variant transition-colors disabled:opacity-40"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

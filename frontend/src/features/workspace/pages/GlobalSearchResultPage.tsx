import { useCallback, useMemo, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { MessageCircle, FileText, Folder, Lock, User, Paperclip } from "lucide-react";
import { useLazyGlobalSearchQuery, type SearchFilters } from "./searchApi";
import { cn } from "../../../shared/lib/utils";

function highlight(text: string, query: string) {
    if (!query.trim()) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return text.replace(new RegExp(`(${escaped})`, "gi"), "<mark class='bg-primary/20 text-primary rounded-sm px-0.5'>$1</mark>");
}

function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

function dateOffset(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString();
}

type DateRange = "all" | "30" | "7" | "1" | "custom";

export default function GlobalSearchResultPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const [activeTab, setActiveTab] = useState("All");
    const [dateRange, setDateRange] = useState<DateRange>("all");
    const [senderFilter, setSenderFilter] = useState("");
    const [mimeTypeFilter, setMimeTypeFilter] = useState<string | null>(null);
    const navigate = useNavigate();
    const [trigger, { data, isLoading, isError }] = useLazyGlobalSearchQuery();

    const activeFilters = useMemo((): SearchFilters => {
        const filters: SearchFilters = {};
        if (dateRange === "30") filters.fromDate = dateOffset(30);
        else if (dateRange === "7") filters.fromDate = dateOffset(7);
        else if (dateRange === "1") filters.fromDate = dateOffset(1);
        if (senderFilter.trim()) filters.sender = senderFilter.trim();
        if (mimeTypeFilter) filters.mimeType = mimeTypeFilter;
        return filters;
    }, [dateRange, senderFilter, mimeTypeFilter]);

    const triggerSearch = useCallback((q: string, tab: string, filters: SearchFilters) => {
        if (!q) return;
        trigger({
            q,
            type: tab === "All" ? undefined : tab.toLowerCase(),
            ...filters,
        });
    }, [trigger]);

    useState(() => {
        if (query) triggerSearch(query, activeTab, activeFilters);
    });

    const tabs = ["All", "Messages", "Channels", "Users", "Tasks", "Files"];

    const messages = data?.messages ?? [];
    const channels = data?.channels ?? [];
    const users = data?.users ?? [];
    const tasks = data?.tasks ?? [];
    const files = data?.files ?? [];

    const totalResults = messages.length + channels.length + users.length + tasks.length + files.length;

    return (
        <div className="flex h-full">
            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3 mb-6">
                        <h2 className="font-headline-lg text-headline-lg">
                            Search Results for <span className="text-primary italic">'{query}'</span>
                        </h2>
                        {data && <span className="text-on-surface-variant font-code-md text-code-md">{totalResults} results</span>}
                    </div>
                    <div className="flex gap-2 border-b border-outline-variant">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab);
                                    triggerSearch(query, tab, activeFilters);
                                }}
                                className={`px-4 py-2 font-label-md ${
                                    activeTab === tab
                                        ? "text-primary font-bold border-b-2 border-primary"
                                        : "text-on-surface-variant hover:text-on-surface transition-colors"
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading && (
                    <div className="text-center py-12 text-on-surface-variant font-body-md">Searching...</div>
                )}

                {isError && (
                    <div className="bg-error-container/10 border border-error/30 rounded-lg p-6 text-center">
                        <p className="font-body-md text-body-md text-error">Search failed. Please try again.</p>
                    </div>
                )}

                {data && totalResults === 0 && !isLoading && !isError && (
                    <div className="text-center py-12 text-on-surface-variant">
                        <p className="font-body-md text-body-md">No results found for "{query}"</p>
                    </div>
                )}

                {data && totalResults > 0 && (
                <div className="space-y-10">
                    {messages.length > 0 && (activeTab === "All" || activeTab === "Messages") && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                                <MessageCircle size={20} /> Messages
                            </h3>
                            <span className="text-label-md text-on-surface-variant">{messages.length} results</span>
                        </div>
                        <div className="space-y-3">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className="bg-surface-container/70 border border-outline-variant p-4 hover:border-primary/50 transition-all cursor-pointer group"
                                    onClick={() => msg.channelId && navigate(`/channels/${msg.channelId}`)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-primary-container flex items-center justify-center text-xs font-bold">
                                                {msg.senderName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-on-surface">{msg.senderName}</span>
                                            <span className="text-xs text-on-surface-variant code-font">{msg.channelName}</span>
                                        </div>
                                        <span className="text-xs text-on-surface-variant">{timeAgo(msg.createdAt)}</span>
                                    </div>
                                    <p
                                        className="text-body-md text-on-surface-variant line-clamp-2"
                                        dangerouslySetInnerHTML={{ __html: highlight(msg.content, query) }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                    )}

                    {channels.length > 0 && (activeTab === "All" || activeTab === "Channels") && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                                <Folder size={20} /> Channels
                            </h3>
                            <span className="text-label-md text-on-surface-variant">{channels.length} results</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {channels.map((ch) => (
                                <Link
                                    key={ch.id}
                                    to={`/channels/${ch.name}`}
                                    className="bg-surface-container/70 border border-outline-variant p-4 border-l-4 border-l-primary hover:bg-surface-variant transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Lock size={14} className="text-on-surface-variant" />
                                        <span className="font-bold text-on-surface">{ch.name}</span>
                                    </div>
                                    {ch.description && (
                                        <p
                                            className="text-xs text-on-surface-variant line-clamp-2"
                                            dangerouslySetInnerHTML={{ __html: highlight(ch.description, query) }}
                                        />
                                    )}
                                </Link>
                            ))}
                        </div>
                    </section>
                    )}

                    {users.length > 0 && (activeTab === "All" || activeTab === "Users") && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                                <User size={20} /> Users
                            </h3>
                            <span className="text-label-md text-on-surface-variant">{users.length} results</span>
                        </div>
                        <div className="space-y-2">
                            {users.map((u) => (
                                <div key={u.id} className="bg-surface-container/70 border border-outline-variant p-3 flex items-center gap-3 hover:bg-surface-variant transition-colors">
                                    <div className="w-9 h-9 rounded-full bg-surface-container-highest overflow-hidden shrink-0">
                                        {u.image ? (
                                            <img src={u.image} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-label-md bg-surface-variant text-on-surface-variant">
                                                {u.name.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <p
                                        className="font-label-md text-label-md text-on-surface"
                                        dangerouslySetInnerHTML={{ __html: highlight(u.name, query) }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                    )}

                    {tasks.length > 0 && (activeTab === "All" || activeTab === "Tasks") && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                                <FileText size={20} /> Tasks
                            </h3>
                            <span className="text-label-md text-on-surface-variant">{tasks.length} results</span>
                        </div>
                        <div className="space-y-3">
                            {tasks.map((task) => (
                                <div key={task.id} className="bg-surface-container/70 border border-outline-variant p-4 flex items-center gap-4 group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span
                                                className="font-bold text-on-surface"
                                                dangerouslySetInnerHTML={{ __html: highlight(task.title, query) }}
                                            />
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-bold uppercase tracking-wider">
                                                {task.status}
                                            </span>
                                        </div>
                                        {task.description && (
                                            <p
                                                className="text-xs text-on-surface-variant line-clamp-1"
                                                dangerouslySetInnerHTML={{ __html: highlight(task.description, query) }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    )}

                    {files.length > 0 && (activeTab === "All" || activeTab === "Files") && (
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
                                <Paperclip size={20} /> Files
                            </h3>
                            <span className="text-label-md text-on-surface-variant">{files.length} results</span>
                        </div>
                        <div className="space-y-3">
                            {files.map((file) => (
                                <div key={file.id} className="bg-surface-container/70 border border-outline-variant p-4 flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                        <Paperclip size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p
                                            className="font-medium text-on-surface truncate"
                                            dangerouslySetInnerHTML={{ __html: highlight(file.originalName, query) }}
                                        />
                                        <p className="text-xs text-on-surface-variant mt-0.5">
                                            {(file.size / 1024).toFixed(1)} KB &middot; {file.mimeType} &middot; {timeAgo(file.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                    )}
                </div>
                )}

                {!query && !isLoading && (
                    <div className="text-center py-12 text-on-surface-variant">
                        <p className="font-body-md text-body-md">Enter a search term to find messages, channels, users, tasks, and files</p>
                    </div>
                )}
            </div>

            <aside className="w-80 border-l border-outline-variant bg-surface-container-low p-6 space-y-8 hidden lg:block shrink-0">
                <div>
                    <h4 className="text-label-sm uppercase tracking-widest text-on-surface-variant mb-4 font-bold">Advanced Filters</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-on-surface-variant mb-2 font-bold">Date Range</label>
                            <select
                                value={dateRange}
                                onChange={(e) => {
                                    setDateRange(e.target.value as DateRange);
                                    triggerSearch(query, activeTab, { ...activeFilters, fromDate: e.target.value === "all" ? undefined : dateOffset(Number(e.target.value)) });
                                }}
                                className="w-full bg-surface-container border border-outline-variant p-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                            >
                                <option value="all">All Time</option>
                                <option value="30">Last 30 Days</option>
                                <option value="7">Last 7 Days</option>
                                <option value="1">Last 24 Hours</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-on-surface-variant mb-2 font-bold">Sent By</label>
                            <input
                                value={senderFilter}
                                onChange={(e) => setSenderFilter(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") triggerSearch(query, activeTab, { ...activeFilters, sender: (e.target as HTMLInputElement).value.trim() || undefined });
                                }}
                                className="w-full bg-surface-container border border-outline-variant p-2 text-xs text-on-surface focus:outline-none focus:border-primary"
                                placeholder="Search user..."
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-on-surface-variant mb-2 font-bold">File Type</label>
                            <div className="flex flex-wrap gap-2">
                                {(["image", "application/pdf"] as const).map((mime) => (
                                    <span
                                        key={mime}
                                        onClick={() => {
                                            const next = mimeTypeFilter === mime ? null : mime;
                                            setMimeTypeFilter(next);
                                            triggerSearch(query, activeTab, { ...activeFilters, mimeType: next ?? undefined });
                                        }}
                                        className={cn(
                                            "px-2 py-1 text-[10px] cursor-pointer border transition-colors",
                                            mimeTypeFilter === mime
                                                ? "bg-primary/10 border-primary text-primary"
                                                : "bg-surface-container border-outline-variant text-on-surface-variant hover:border-primary"
                                        )}
                                    >
                                        {mime === "image" ? "Image" : "PDF"}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6 border-t border-outline-variant">
                    <h4 className="text-label-sm uppercase tracking-widest text-on-surface-variant mb-4 font-bold">Search Insights</h4>
                    <div className="p-3 bg-surface-container-highest">
                        <div className="text-[10px] text-on-surface-variant mb-2">Weekly Volume Trend</div>
                        <div className="h-16 w-full flex items-end gap-1 px-1">
                            <div className="flex-1 bg-primary/20 h-[30%] rounded-t-sm" />
                            <div className="flex-1 bg-primary/20 h-[45%] rounded-t-sm" />
                            <div className="flex-1 bg-primary/20 h-[25%] rounded-t-sm" />
                            <div className="flex-1 bg-primary/20 h-[60%] rounded-t-sm" />
                            <div className="flex-1 bg-primary/20 h-[85%] rounded-t-sm" />
                            <div className="flex-1 bg-primary h-[100%] rounded-t-sm" />
                            <div className="flex-1 bg-primary/50 h-[70%] rounded-t-sm" />
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden border border-outline-variant aspect-square relative flex items-center justify-center bg-surface-container-highest/50">
                    <div className="text-center">
                        <div className="text-[10px] text-primary font-bold uppercase tracking-widest">Network Map</div>
                        <div className="text-xs text-on-surface-variant mt-1">Data connection nodes</div>
                    </div>
                </div>
            </aside>
        </div>
    );
}

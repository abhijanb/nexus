import { useState, useEffect, useRef, useCallback } from "react";
import {
  useLazyGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useBulkMarkNotificationsReadMutation,
  useBulkDeleteNotificationsMutation,
  useGetUnreadNotificationCountQuery,
  type NotificationItem,
} from "../workspaceApi";
import { Bell, CheckCheck, Trash2, CheckSquare, Square, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../../shared/lib/utils";

const PAGE_SIZE = 20;

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [trigger] = useLazyGetNotificationsQuery();
  const { data: unreadData } = useGetUnreadNotificationCountQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();
  const [deleteNotification] = useDeleteNotificationMutation();
  const [bulkMarkRead] = useBulkMarkNotificationsReadMutation();
  const [bulkDelete] = useBulkDeleteNotificationsMutation();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isError, setIsError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setIsError(false);
    try {
      const result = await trigger({ limit: PAGE_SIZE }).unwrap();
      setNotifications(result.data);
      setNextCursor(result.meta.nextCursor);
      setHasMore(result.meta.hasMore);
    } catch {
      setIsError(true);
    } finally {
      setLoading(false);
    }
  }, [trigger]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await trigger({ cursor: nextCursor, limit: PAGE_SIZE }).unwrap();
      setNotifications((prev) => [...prev, ...result.data]);
      setNextCursor(result.meta.nextCursor);
      setHasMore(result.meta.hasMore);
    } catch {
      /* silent fail */
    } finally {
      setLoadingMore(false);
    }
  }, [nextCursor, loadingMore, trigger]);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore || loadingMore || loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && nextCursor && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    const sentinel = sentinelRef.current;
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, nextCursor, loadingMore, loading, loadMore]);

  const unreadCount = unreadData?.count ?? 0;

  const selectAll = notifications.length > 0 && selectedIds.size === notifications.length;
  const someSelected = selectedIds.size > 0;

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map((n) => n.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkMarkRead = async () => {
    await bulkMarkRead(Array.from(selectedIds));
    clearSelection();
  };

  const handleBulkDelete = async () => {
    await bulkDelete(Array.from(selectedIds));
    clearSelection();
  };

  const handleClick = (n: NotificationItem) => {
    if (someSelected) {
      toggleSelect(n.id);
      return;
    }
    if (!n.isRead) markRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Notifications</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {unreadCount} unread
          </p>
        </div>
        {unreadCount > 0 && !someSelected && (
          <button
            onClick={() => markAllRead()}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant hover:bg-surface-variant transition-colors text-on-surface font-label-md text-label-md"
          >
            <CheckCheck size={16} />
            Mark all read
          </button>
        )}
      </div>

      {/* Bulk action bar */}
      {someSelected && (
        <div className="flex items-center justify-between mb-4 px-4 py-2.5 bg-surface-container-high border border-outline-variant rounded-lg">
          <div className="flex items-center gap-3">
            <button onClick={clearSelection} className="p-0.5 text-on-surface-variant hover:text-on-surface transition-colors">
              <X size={16} />
            </button>
            <span className="font-label-md text-label-md text-on-surface">
              {selectedIds.size} selected
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkMarkRead}
              className="flex items-center gap-1.5 px-3 py-1.5 text-label-sm text-on-surface hover:bg-surface-variant rounded-lg transition-colors"
            >
              <CheckCheck size={14} />
              Mark read
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 text-label-sm text-error hover:bg-error/10 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-on-surface-variant font-body-md">Loading...</div>
      ) : isError ? (
        <div className="bg-error-container/10 border border-error/30 rounded-lg p-6 text-center">
          <p className="font-body-md text-body-md text-error">Failed to load notifications</p>
          <button
            onClick={loadInitial}
            className="mt-4 px-4 py-2 bg-error text-on-error rounded font-label-md text-label-md hover:opacity-90"
          >
            Retry
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-12 text-on-surface-variant">
          <Bell size={48} className="mx-auto mb-4 opacity-30" />
          <p className="font-body-md text-body-md">No notifications yet</p>
        </div>
      ) : (
        <div>
          {/* Select all header */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-outline-variant">
            <button onClick={toggleSelectAll} className="text-on-surface-variant hover:text-on-surface transition-colors">
              {selectAll ? <CheckSquare size={16} /> : <Square size={16} />}
            </button>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {selectAll ? "Deselect all" : "Select all"}
            </span>
          </div>
          <div className="space-y-1">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "flex items-start gap-3 p-4 border border-outline-variant cursor-pointer transition-colors hover:bg-surface-variant/50",
                  !n.isRead ? "bg-primary-container/5 border-l-primary border-l-2" : "",
                )}
              >
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelect(n.id); }}
                  className={cn(
                    "mt-0.5 shrink-0 transition-colors",
                    selectedIds.has(n.id) ? "text-primary" : "text-outline hover:text-on-surface-variant",
                  )}
                >
                  {selectedIds.has(n.id) ? <CheckSquare size={16} /> : <Square size={16} />}
                </button>
                <div className="flex-1 min-w-0 flex items-start gap-3">
                  <div className={`w-2 h-2 mt-2 rounded-full shrink-0 ${n.isRead ? "bg-transparent" : "bg-primary"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={cn("font-label-md text-label-md", n.isRead ? "text-on-surface" : "text-on-surface font-bold")}>
                      {n.title}
                    </p>
                    {n.body && (
                      <p className="text-body-md text-on-surface-variant mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[10px] text-on-surface-variant mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                  className="p-1.5 text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-4" />

          {loadingMore && (
            <div className="text-center py-4 text-on-surface-variant font-body-md text-sm">
              Loading more...
            </div>
          )}

          {!hasMore && notifications.length > 0 && (
            <div className="text-center py-6 text-on-surface-variant text-label-sm">
              All caught up
            </div>
          )}
        </div>
      )}
    </div>
  );
}

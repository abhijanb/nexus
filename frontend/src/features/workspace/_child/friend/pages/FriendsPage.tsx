import { useState, useEffect, useRef } from "react";
import { Users, X, Check, MessageCircle, Search, UserPlus, UserX } from "lucide-react";
import { toast } from "sonner";
import {
  useGetFriendsQuery,
  useGetPendingFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
  useAddFriendMutation,
  useRemoveFriendMutation,
  useLazySearchUsersQuery,
} from "../../../workspaceApi";
import { useAppSelector } from "../../../../../app/hooks";

export default function FriendsPage() {
  const onlineUserIds = useAppSelector((s) => s.presence.onlineUserIds);
  const { data: friends = [], isLoading: friendsLoading, isError: friendsError } = useGetFriendsQuery();
  const { data: pending = [], isLoading: pendingLoading, isError: pendingError } = useGetPendingFriendRequestsQuery();
  const [acceptRequest] = useAcceptFriendRequestMutation();
  const [rejectRequest] = useRejectFriendRequestMutation();
  const [addFriend] = useAddFriendMutation();
  const [removeFriend] = useRemoveFriendMutation();
  const [addUserId, setAddUserId] = useState("");
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
  const [searchUsers, { data: searchResults = [], isFetching: searching }] = useLazySearchUsersQuery();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const friendIds = new Set(friends.map((f) => f.id));
  const filteredResults = searchResults.filter((u) => !friendIds.has(u.id));

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!addUserId.trim()) return;
    debounceRef.current = setTimeout(() => {
      searchUsers(addUserId.trim());
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [addUserId, searchUsers]);

  useEffect(() => {
    const pending = new Set(searchResults.filter((u) => u.hasPendingRequest).map((u) => u.id));
    if (pending.size > 0) {
      setInvitedIds((prev) => {
        const next = new Set(prev);
        pending.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [searchResults]);

  if (friendsLoading || pendingLoading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 w-48 bg-surface-container-high rounded" />
        <div className="h-4 w-64 bg-surface-container-high rounded" />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 space-y-6">
            <div className="h-48 bg-surface-container-high rounded" />
            <div className="h-64 bg-surface-container-high rounded" />
          </div>
          <div className="col-span-4 space-y-6">
            <div className="h-32 bg-surface-container-high rounded" />
            <div className="h-48 bg-surface-container-high rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (friendsError || pendingError) {
    return (
      <div className="bg-error-container/10 border border-error/30 rounded-lg p-6 text-center">
        <p className="font-body-md text-body-md text-error mb-2">Failed to load friends</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-error text-on-error rounded font-label-md text-label-md hover:opacity-90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Social Hub</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage connections, requests, and network synchronization.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => {
              const input = prompt("Enter user ID or email to add:");
              if (input?.trim()) addFriend(input.trim());
            }}
            className="flex items-center gap-2 px-4 py-2 border border-outline-variant hover:bg-surface-variant transition-colors text-on-surface font-label-md text-label-md">
            <Users size={18} />
            Invite Friends
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 items-start">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <section className="bg-surface-container/70 border border-outline-variant p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <h3 className="font-label-md text-label-md text-on-surface-variant flex items-center gap-2 uppercase tracking-wider">
                <Users size={16} className="text-primary" />
                PENDING REQUESTS ({pending.length})
              </h3>
              <button className="text-primary font-label-sm text-label-sm hover:underline">
                View Sent Requests
              </button>
            </div>
            {pending.length === 0 ? (
              <p className="text-body-md text-on-surface-variant py-8 text-center">No pending requests</p>
            ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {pending.map((req) => (
                <div key={req.id} className="p-4 bg-surface-container-high border border-outline-variant flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border border-outline-variant overflow-hidden bg-surface-variant flex items-center justify-center shrink-0">
                      {req.user.image ? (
                        <img src={req.user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <Users size={18} className="text-on-surface-variant" />
                      )}
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">{req.user.name}</p>
                      <p className="font-code-md text-[10px] text-on-surface-variant">via connection request</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => acceptRequest(req.id)}
                      className="w-8 h-8 flex items-center justify-center bg-secondary-container text-on-secondary-container hover:brightness-110"
                      title="Accept"
                    >
                      <Check size={16} />
                    </button>
                    <button
                      onClick={() => rejectRequest(req.id)}
                      className="w-8 h-8 flex items-center justify-center bg-error-container text-on-error-container hover:brightness-110"
                      title="Reject"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </section>

          <section className="bg-surface-container/70 border border-outline-variant overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex items-center justify-between">
              <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                ACTIVE CONNECTIONS
              </h3>
              <select className="bg-surface-container-low border border-outline-variant text-label-sm font-label-sm text-on-surface px-3 py-1 outline-none">
                <option>Status: All</option>
                <option>Online Only</option>
                <option>Recently Active</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-lowest border-b border-outline-variant">
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase">User</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase">Status</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase">Mutual Channels</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {friends.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant font-body-md">
                        No friends yet. Send a connection request to get started.
                      </td>
                    </tr>
                  ) : friends.map((friend) => (
                    <tr key={friend.id} className="hover:bg-surface-variant/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div className="w-9 h-9 border border-outline-variant bg-surface-container overflow-hidden">
                              {friend.image ? (
                                <img src={friend.image} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-primary-fixed-dim bg-surface-variant font-headline-md">
                                  {friend.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface-container ${onlineUserIds.includes(friend.id) ? "bg-secondary" : "bg-outline"}`} />
                          </div>
                          <div>
                            <p className="font-label-md text-label-md text-on-surface">{friend.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${onlineUserIds.includes(friend.id) ? "bg-secondary" : "bg-outline"}`} />
                          <span className="font-code-md text-label-md text-on-surface-variant uppercase">{onlineUserIds.includes(friend.id) ? "Online" : "Offline"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-code-md text-[10px] text-on-surface-variant">—</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button className="p-2 hover:text-primary transition-colors text-on-surface-variant" title="Message">
                            <MessageCircle size={18} />
                          </button>
                          <button
                            onClick={() => {
                              removeFriend(friend.id);
                              toast.success(`Removed ${friend.name}`);
                            }}
                            className="p-2 hover:text-error transition-colors text-on-surface-variant"
                            title="Remove friend"
                          >
                            <UserX size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <aside className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-surface-container/70 border border-outline-variant p-6 space-y-4">
            <h4 className="font-label-md text-label-md text-on-surface flex items-center gap-2">
              <Search size={16} className="text-primary" />
              ADD NEW USER
            </h4>
            <div className="space-y-3">
              <input
                value={addUserId}
                onChange={(e) => setAddUserId(e.target.value)}
                className="w-full bg-surface-container border border-outline-variant text-body-md font-body-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                placeholder="Search by name or email..."
              />
              {searching && (
                <p className="text-label-sm text-on-surface-variant animate-pulse">Searching...</p>
              )}
              {!searching && addUserId.trim() && filteredResults.length === 0 && (
                <p className="text-label-sm text-on-surface-variant">No users found</p>
              )}
              {filteredResults.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-surface-container-high border border-outline-variant">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 border border-outline-variant overflow-hidden bg-surface-variant flex items-center justify-center shrink-0">
                      {user.image ? (
                        <img src={user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="font-headline-md text-on-surface-variant">{user.name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-label-md text-label-md text-on-surface">{user.name}</p>
                      <p className="font-code-md text-[10px] text-on-surface-variant">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (invitedIds.has(user.id)) {
                        removeFriend(user.id);
                        setInvitedIds((prev) => { const next = new Set(prev); next.delete(user.id); return next; });
                        toast.success(`Friend request to ${user.name} cancelled`);
                      } else {
                        addFriend(user.id);
                        setInvitedIds((prev) => new Set(prev).add(user.id));
                        toast.success(`Friend request sent to ${user.name}`);
                      }
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 font-label-sm text-label-sm transition-all ${invitedIds.has(user.id) ? "bg-surface-container-high text-on-surface-variant border border-outline-variant hover:bg-error-container hover:text-on-error-container" : "bg-primary text-on-primary hover:brightness-110"}`}
                  >
                    {invitedIds.has(user.id) ? <X size={14} /> : <UserPlus size={14} />}
                    {invitedIds.has(user.id) ? "Invited" : "Invite"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-surface-container/70 border border-outline-variant p-6 space-y-4">
            <h4 className="font-label-md text-label-md text-on-surface">NETWORK REACH</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-outline-variant bg-surface-container-low">
                <p className="font-code-md text-[20px] text-primary">{friends.length}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Connections</p>
              </div>
              <div className="p-4 border border-outline-variant bg-surface-container-low">
                <p className="font-code-md text-[20px] text-secondary">{friends.filter(f => onlineUserIds.includes(f.id)).length}</p>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">Active Now</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

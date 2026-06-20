import { useParams, NavLink, useNavigate } from "react-router-dom";
import {
  useGetChannelQuery,
  useGetChannelsQuery,
  useLazyGetMessagesQuery,
  useGetChannelMembersQuery,
  useAddChannelMemberMutation,
  useRemoveChannelMemberMutation,
  useLazySearchUsersQuery,
  useDeleteChannelMutation,
  useUpdateMessageMutation,
  type ChannelMember,
  type Message,
} from "../../../workspaceApi";
import { LoadingSpinner } from "../../../../../shared/components/LoadingSpinner";
import { Modal } from "../../../../../shared/components/Modal";
import { TypingIndicator } from "../../../../../shared/components/TypingIndicator";
import {
  Search,
  MoreVertical,
  Users,
  X,
  Plus,
  Trash2,
  Menu,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { authClient } from "../../../../../shared/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import { getSocket } from "../../../../../shared/lib/socket";
import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";
import { channelApi } from "../channelApi";
import { useLazyGlobalSearchQuery } from "../../../pages/searchApi";

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

export default function ChannelPage() {
  const dispatch = useAppDispatch();
  const onlineUserIds = useAppSelector((s) => s.presence.onlineUserIds);
  const { channelName } = useParams<{ channelName: string }>();
  const navigate = useNavigate();
  const { data: channel, isLoading, isError } = useGetChannelQuery(channelName ?? "");
  const { data: channels = [] } = useGetChannelsQuery();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [channelSearchQuery, setChannelSearchQuery] = useState("");
  const [triggerChannelSearch, { data: searchData, isLoading: searchLoading }] = useLazyGlobalSearchQuery();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [channelListOpen, setChannelListOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) setCurrentUserId(data.user.id);
    });
  }, []);

  const channelId = channel?.id ?? "";
  const [loadMessages] = useLazyGetMessagesQuery();
  const [messages, setMessages] = useState<Message[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const hasInitiallyLoaded = useRef(false);
  const { data: queryMembers = [] } = useGetChannelMembersQuery(channelId, { skip: !channelId });
  const [members, setMembers] = useState<ChannelMember[]>(queryMembers);

  useEffect(() => {
    if (queryMembers.length > 0) setMembers(queryMembers);
  }, [queryMembers]);

  const [addMember] = useAddChannelMemberMutation();
  const [removeMember] = useRemoveChannelMemberMutation();
  const [searchUsers, { data: searchResults = [], isFetching: searching }] = useLazySearchUsersQuery();

  useEffect(() => {
    if (!channelId || hasInitiallyLoaded.current) return;
    hasInitiallyLoaded.current = true;
    setMessages([]);
    setCursor(null);
    setHasMore(true);
    loadMessages({ channelId, limit: 50 }).unwrap().then((result) => {
      setMessages(result.messages);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
      setPageLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView(), 50);
    });
  }, [channelId, loadMessages]);

  useEffect(() => {
    if (!channelId) return;
    const socket = getSocket();
    socket.emit("join:channel", channelId);

    socket.on("new:message", (message: Message) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      dispatch(channelApi.util.updateQueryData("getMessages", { channelId }, (draft) => {
        if (!draft.messages.find((m: Message) => m.id === message.id)) {
          draft.messages.push(message);
        }
      }));
    });

    socket.on("message:deleted", (data: { channelId: string; messageId: string }) => {
      setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
      dispatch(channelApi.util.updateQueryData("getMessages", { channelId }, (draft) => {
        const idx = draft.messages.findIndex((m: Message) => m.id === data.messageId);
        if (idx !== -1) draft.messages.splice(idx, 1);
      }));
    });

    socket.on("member:joined", (data: { userId: string; name: string; image: string | null }) => {
      setMembers((prev) => {
        if (prev.find((m) => m.userId === data.userId)) return prev;
        return [
          ...prev,
          {
            id: "",
            channelId,
            userId: data.userId,
            role: "MEMBER" as const,
            joinedAt: new Date().toISOString(),
            user: { id: data.userId, name: data.name, email: "", image: data.image },
          },
        ];
      });
      dispatch(channelApi.util.updateQueryData("getChannelMembers", channelId, (draft) => {
        if (!draft.find((m) => m.userId === data.userId)) {
          draft.push({ id: "", channelId, userId: data.userId, role: "MEMBER", joinedAt: new Date().toISOString(), user: { id: data.userId, name: data.name, email: "", image: data.image } });
        }
      }));
    });
    socket.on("member:left", (data: { userId: string }) => {
      setMembers((prev) => prev.filter((m) => m.userId !== data.userId));
      dispatch(channelApi.util.updateQueryData("getChannelMembers", channelId, (draft) => {
        const idx = draft.findIndex((m) => m.userId === data.userId);
        if (idx !== -1) draft.splice(idx, 1);
      }));
    });

    return () => {
      socket.emit("leave:channel", channelId);
      socket.off("new:message");
      socket.off("message:deleted");
      socket.off("member:joined");
      socket.off("member:left");
    };
  }, [channelId, dispatch]);

  const handleLoadEarlier = async () => {
    if (!channelId || !cursor || loadingMore) return;
    setLoadingMore(true);
    const prevHeight = messagesContainerRef.current?.scrollHeight ?? 0;
    const prevScroll = messagesContainerRef.current?.scrollTop ?? 0;
    try {
      const result = await loadMessages({ channelId, cursor, limit: 50 }).unwrap();
      setMessages((prev) => [...result.messages, ...prev]);
      setCursor(result.nextCursor);
      setHasMore(result.hasMore);
      requestAnimationFrame(() => {
        if (messagesContainerRef.current) {
          const newHeight = messagesContainerRef.current.scrollHeight;
          messagesContainerRef.current.scrollTop = newHeight - prevHeight + prevScroll;
        }
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const [isAtBottom, setIsAtBottom] = useState(true);
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    setIsAtBottom(scrollHeight - scrollTop - clientHeight < 100);
  };

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isAtBottom]);

  const [message, setMessage] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const [updateMessage] = useUpdateMessageMutation();

  const handleSend = () => {
    if (!message.trim() || !channelId) return;
    getSocket().emit("send:message", { channelId, content: message });
    setMessage("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) {
      getSocket().emit("typing:stop", { channelId });
      isTypingRef.current = false;
    }
  };

  const handleMessageChange = (value: string) => {
    setMessage(value);
    if (!channelId) return;
    if (!isTypingRef.current && value.trim()) {
      getSocket().emit("typing:start", { channelId });
      isTypingRef.current = true;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        getSocket().emit("typing:stop", { channelId });
        isTypingRef.current = false;
      }
    }, 2000);
  };

  const handleEdit = async (msgId: string) => {
    if (!editContent.trim()) return;
    await updateMessage({ channelId, messageId: msgId, content: editContent });
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleDelete = (msgId: string) => {
    getSocket().emit("delete:message", { channelId, messageId: msgId });
    setDeletingMessageId(null);
  };

  const startEditing = (msg: Message) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const [deleteChannel] = useDeleteChannelMutation();

  const handleDeleteChannel = async () => {
    await deleteChannel(channelId).unwrap();
    const remaining = channels.filter((c) => c.id !== channelId);
    if (remaining.length > 0) {
      navigate(`/channels/${remaining[0].name}`);
    } else {
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    if (!isSearching || !channelSearchQuery.trim() || !channelId) return;
    const timer = setTimeout(() => {
      triggerChannelSearch({ q: channelSearchQuery.trim(), type: "messages", channelId });
    }, 300);
    return () => clearTimeout(timer);
  }, [channelSearchQuery, isSearching, channelId, triggerChannelSearch]);

  useEffect(() => {
    if (!isSearching) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setIsSearching(false); setChannelSearchQuery(""); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isSearching]);

  const currentMember = members.find((m) => m.userId === currentUserId);
  const canManage = currentMember?.role === "OWNER" || currentMember?.role === "MODERATOR";
  const isOwner = currentMember?.role === "OWNER";

  useEffect(() => {
    if (!addMemberOpen || searchQuery.length < 2) return;
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, addMemberOpen, searchUsers]);

  const handleAddMember = async (userId: string) => {
    await addMember({ channelId, userId });
    setAddMemberOpen(false);
    setSearchQuery("");
  };

  const handleRemoveMember = async (userId: string) => {
    await removeMember({ channelId, userId });
  };

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <div className="p-8 text-error">Failed to load channel</div>;
  if (!channel) return <div className="p-8 text-on-surface-variant">Channel not found</div>;

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Desktop channel list */}
      <nav className="hidden md:flex w-60 border-r border-outline-variant bg-surface-container-lowest flex-col shrink-0">
        <div className="h-16 px-4 flex items-center border-b border-outline-variant">
          <span className="font-bold text-on-surface-variant text-[11px] uppercase tracking-widest">Channels</span>
        </div>
        <div className="p-2 space-y-0.5 overflow-y-auto flex-1">
          {channels.map((ch) => (
            <NavLink
              key={ch.id}
              to={`/channels/${ch.name}`}
              onClick={() => setChannelListOpen(false)}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded transition-colors flex items-center gap-2 ${isActive ? "bg-surface-container-highest text-on-surface" : "hover:bg-surface-container-high text-on-surface-variant"}`
              }
            >
              <span className={channelName === ch.name ? "text-primary" : "text-outline"}>#</span>
              <span className={channelName === ch.name ? "font-bold" : "font-medium"}>{ch.name}</span>
              {channelName === ch.name && <span className="w-2 h-2 bg-primary rounded-full ml-auto" />}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Mobile channel list drawer */}
      {channelListOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setChannelListOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant animate-slide-in flex flex-col z-50">
            <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant">
              <span className="font-bold text-on-surface-variant text-[11px] uppercase tracking-widest">Channels</span>
              <button onClick={() => setChannelListOpen(false)} className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant">
                <X size={18} />
              </button>
            </div>
            <div className="p-2 space-y-0.5 overflow-y-auto flex-1">
              {channels.map((ch) => (
                <NavLink
                  key={ch.id}
                  to={`/channels/${ch.name}`}
                  onClick={() => setChannelListOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded transition-colors flex items-center gap-2 ${isActive ? "bg-surface-container-highest text-on-surface" : "hover:bg-surface-container-high text-on-surface-variant"}`
                  }
                >
                  <span className={channelName === ch.name ? "text-primary" : "text-outline"}>#</span>
                  <span className={channelName === ch.name ? "font-bold" : "font-medium"}>{ch.name}</span>
                  {channelName === ch.name && <span className="w-2 h-2 bg-primary rounded-full ml-auto" />}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-surface-container overflow-hidden min-w-0">
        <header className="h-16 px-4 md:px-6 border-b border-outline-variant flex items-center justify-between bg-surface/50 backdrop-blur-md sticky top-0 z-10 shrink-0">
          {isSearching ? (
            <div className="flex items-center gap-3 w-full">
              <Search size={18} className="text-on-surface-variant shrink-0" />
              <input
                autoFocus
                value={channelSearchQuery}
                onChange={(e) => setChannelSearchQuery(e.target.value)}
                placeholder="Search in this channel..."
                className="flex-1 bg-transparent border-none outline-none text-sm text-on-surface placeholder:text-outline-variant"
              />
              <button
                onClick={() => { setIsSearching(false); setChannelSearchQuery(""); }}
                className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => setChannelListOpen(true)}
                  className="md:hidden p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors shrink-0"
                  aria-label="Show channel list"
                >
                  <Menu size={20} />
                </button>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-primary font-bold">#</span>
                    <h2 className="font-bold text-on-surface truncate">{channel.name}</h2>
                  </div>
                  {channel.description && (
                    <p className="text-label-md text-on-surface-variant truncate hidden md:block">{channel.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 md:gap-4 shrink-0">
                <button
                  onClick={() => setMemberModalOpen(true)}
                  className="h-9 px-2 md:px-3 border border-outline-variant rounded-lg flex items-center gap-1 md:gap-2 hover:bg-surface-container-high transition-colors text-on-surface-variant text-sm"
                >
                  <Users size={16} />
                  <span>{members.length}</span>
                </button>

                <Search size={18} className="text-on-surface-variant cursor-pointer hover:text-on-surface shrink-0" onClick={() => setIsSearching(true)} />
                <div ref={dropdownRef} className="relative">
                  <button onClick={() => setDropdownOpen((p) => !p)}>
                    <MoreVertical size={18} className="text-on-surface-variant cursor-pointer hover:text-on-surface" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-surface-container-low border border-outline-variant rounded-lg shadow-xl z-20 py-1">
                      {canManage && (
                        <button
                          onClick={() => { setDropdownOpen(false); setMemberModalOpen(true); setAddMemberOpen(true); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container-high transition-colors"
                        >
                          <UserPlus size={16} />
                          Invite people
                        </button>
                      )}
                      {isOwner && (
                        <button
                          onClick={() => { setDropdownOpen(false); setConfirmDeleteOpen(true); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-surface-container-high transition-colors"
                        >
                          <Trash2 size={16} />
                          Delete channel
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </header>

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" onScroll={handleScroll}>
          {isSearching ? (
            <div className="space-y-2">
              {searchLoading && (
                <div className="text-center py-12 text-on-surface-variant font-body-md">Searching...</div>
              )}
              {searchData && searchData.messages.length === 0 && (
                <div className="text-center py-12 text-on-surface-variant">
                  <Search size={40} className="mx-auto mb-4 opacity-30" />
                  <p className="font-body-md text-body-md">No messages found</p>
                  <p className="text-label-sm mt-1">No results for "<span className="text-on-surface">{channelSearchQuery}</span>"</p>
                </div>
              )}
              {searchData && searchData.messages.length > 0 && (
                <>
                  <p className="text-label-md text-on-surface-variant mb-4">
                    {searchData.messages.length} result{searchData.messages.length > 1 ? "s" : ""} for "{channelSearchQuery}"
                  </p>
                  {searchData.messages.map((msg) => (
                    <div
                      key={msg.id}
                      onClick={() => { setIsSearching(false); setChannelSearchQuery(""); }}
                      className="bg-surface-container-low border border-outline-variant p-4 rounded-lg hover:border-primary/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="font-bold text-label-sm text-on-surface">{msg.senderName}</span>
                        <span className="text-[10px] text-on-surface-variant">{timeAgo(msg.createdAt)}</span>
                      </div>
                      <p
                        className="text-body-md text-on-surface-variant line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: highlight(msg.content, channelSearchQuery) }}
                      />
                    </div>
                  ))}
                </>
              )}
              {!searchLoading && !channelSearchQuery.trim() && (
                <div className="text-center py-12 text-on-surface-variant">
                  <p className="font-body-md">Type to search messages in this channel</p>
                </div>
              )}
            </div>
          ) : pageLoading ? (
            <div className="flex items-center justify-center h-full text-on-surface-variant">
              <p className="font-body-md">Loading messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-on-surface-variant">
              <div className="text-center">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-body-md text-body-md">No messages yet</p>
                <p className="text-label-sm mt-1">Start the conversation by sending a message below.</p>
              </div>
            </div>
          ) : (
            <>
              {hasMore && (
                <div className="flex justify-center">
                  <button
                    onClick={handleLoadEarlier}
                    disabled={loadingMore}
                    className="text-xs text-on-surface-variant hover:text-on-surface px-3 py-1.5 border border-outline-variant rounded-full hover:border-outline transition-colors disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Load earlier messages"}
                  </button>
                </div>
              )}
              {messages.map((msg) => {
            const isOwn = msg.sender.id === currentUserId;
            const isEditing = editingMessageId === msg.id;
            return (
              <div key={msg.id} className={`flex gap-3 group ${isOwn ? "flex-row-reverse" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-surface-container-highest shrink-0 overflow-hidden">
                  {msg.sender.image ? (
                    <img src={msg.sender.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-label-md text-on-surface-variant bg-surface-variant">
                      {msg.sender.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isOwn ? "items-end" : ""}`}>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-bold text-label-sm text-on-surface">{msg.sender.name}</span>
                    <span className="text-[10px] text-on-surface-variant">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {msg.isEdited && (
                      <span className="text-[10px] text-on-surface-variant italic">(edited)</span>
                    )}
                  </div>
                  {isEditing ? (
                    <div className="w-full space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full bg-surface-container border border-outline-variant rounded-xl px-4 py-2 text-sm text-on-surface resize-none outline-none focus:border-primary transition-colors"
                        rows={2}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setEditingMessageId(null); setEditContent(""); }}
                          className="text-xs text-on-surface-variant hover:text-on-surface px-2 py-1"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEdit(msg.id)}
                          className="text-xs text-primary font-bold px-2 py-1 hover:underline"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`rounded-xl px-4 py-2 text-sm ${
                        isOwn
                          ? "bg-primary-container text-on-primary-container rounded-tr-sm"
                          : "bg-surface-container-high text-on-surface rounded-tl-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  )}
                  {isOwn && !isEditing && (
                    <div className="flex gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditing(msg)}
                        className="text-[10px] text-on-surface-variant hover:text-primary px-1"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingMessageId(msg.id)}
                        className="text-[10px] text-on-surface-variant hover:text-error px-1"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />

          {/* Delete confirmation modal */}
          <Modal
            open={deletingMessageId !== null}
            onClose={() => setDeletingMessageId(null)}
            title="Delete message"
          >
            <div className="space-y-4">
              <p className="text-sm text-on-surface-variant">
                Are you sure you want to delete this message?
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeletingMessageId(null)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deletingMessageId && handleDelete(deletingMessageId)}
                  className="px-4 py-2 bg-error text-on-error rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>
            </>
          )}
        </div>

        <div className="p-4 bg-surface-container">
          <TypingIndicator channelId={channelId} />
          <div className="flex items-end gap-3 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
            <textarea
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              placeholder={`Message #${channelName ?? "channel"}...`}
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-outline-variant resize-none outline-none min-h-[2.5rem] max-h-[12rem]"
              rows={1}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            />
            <button type="button" onClick={handleSend} className="p-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>
            </button>
          </div>
        </div>
      </div>

      <Modal open={memberModalOpen} onClose={() => { setMemberModalOpen(false); setAddMemberOpen(false); }} title={`Members (${members.length})`}>
        {addMemberOpen ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-9 pr-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline-variant outline-none focus:border-primary"
                />
              </div>
              <button onClick={() => { setAddMemberOpen(false); setSearchQuery(""); }} className="p-2 rounded hover:bg-surface-container-high text-on-surface-variant">
                <X size={16} />
              </button>
            </div>
            {searching && <p className="text-sm text-on-surface-variant">Searching...</p>}
            {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-on-surface-variant">No users found</p>
            )}
            {!searching && searchResults.map((user) => {
              const alreadyMember = members.some((m) => m.userId === user.id);
              return (
                <div key={user.id} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden">
                      {user.image ? (
                        <img src={user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-label-md text-on-surface-variant bg-surface-variant">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{user.name}</p>
                      <p className="text-xs text-on-surface-variant">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMember(user.id)}
                    disabled={alreadyMember}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      alreadyMember
                        ? "bg-surface-container-high text-outline cursor-not-allowed"
                        : "bg-primary text-on-primary hover:opacity-90"
                    }`}
                  >
                    {alreadyMember ? "Added" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {canManage && (
              <button
                onClick={() => setAddMemberOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-high transition-colors text-sm font-medium text-primary"
              >
                <Plus size={18} />
                Add people
              </button>
            )}
            <div className="h-px bg-outline-variant my-2" />
            {members.map((member) => (
              <div key={member.id} className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-container-high group">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden">
                      {member.user.image ? (
                        <img src={member.user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-label-md text-on-surface-variant bg-surface-variant">
                          {member.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-surface-container ${onlineUserIds.includes(member.userId) ? "bg-secondary" : "bg-outline"}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-on-surface">{member.user.name}</p>
                      {member.userId === currentUserId && (
                        <span className="text-[10px] text-on-surface-variant">(you)</span>
                      )}
                    </div>
                    <p className="text-xs text-on-surface-variant capitalize">{member.role.toLowerCase()}</p>
                  </div>
                </div>
                {canManage && member.userId !== currentUserId && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="p-1.5 rounded hover:bg-surface-container-highest text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Modal>

      <Modal open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} title="Delete channel">
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to delete <strong className="text-on-surface">#{channel.name}</strong>? This action cannot be undone. All messages and files will be permanently removed.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmDeleteOpen(false)}
              className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteChannel}
              className="px-4 py-2 rounded-lg bg-error text-on-error text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Delete channel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

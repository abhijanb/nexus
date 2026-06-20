import { useParams, useNavigate } from "react-router-dom";
import {
  useGetConversationsQuery,
  useCreateConversationMutation,
  useLazyGetDMMessagesQuery,
  useMarkConversationReadMutation,
  useUpdateDMMessageMutation,
  useDeleteConversationMutation,
  useLazySearchUsersQuery,
  type Conversation,
  type DMMessage,
} from "../../../workspaceApi";
import { LoadingSpinner } from "../../../../../shared/components/LoadingSpinner";
import { Modal } from "../../../../../shared/components/Modal";
import { TypingIndicator } from "../../../../../shared/components/TypingIndicator";
import { getSocket } from "../../../../../shared/lib/socket";
import { authClient } from "../../../../../shared/lib/auth-client";
import { useAppDispatch, useAppSelector } from "../../../../../app/hooks";
import { dmApi } from "../dmApi";
import { cn } from "../../../../../shared/lib/utils";
import { Search, MessageCircle, Plus, X, Send, Trash2, ChevronUp, Menu } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { VideoCallButton } from "../../../../videoCall";

export default function DMPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const navigate = useNavigate();
  const { data: conversations = [], isLoading } = useGetConversationsQuery();
  const onlineUserIds = useAppSelector((s) => s.presence.onlineUserIds);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchUsers, { data: searchResults = [], isFetching: searching }] = useLazySearchUsersQuery();
  const [createConversation] = useCreateConversationMutation();
  const [convListOpen, setConvListOpen] = useState(false);

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.user) setCurrentUserId(data.user.id);
    });
  }, []);

  useEffect(() => {
    if (!newConvOpen || searchQuery.length < 2) return;
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, newConvOpen, searchUsers]);

  const handleStartConversation = async (participantId: string) => {
    try {
      const conv = await createConversation({ participantId }).unwrap();
      setNewConvOpen(false);
      setSearchQuery("");
      navigate(`/dm/${conv.id}`);
    } catch {
      setNewConvOpen(false);
    }
  };

  const selectedConversation = conversations.find((c) => c.id === conversationId);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="flex flex-1 overflow-hidden h-full">
      {/* Desktop conversation list */}
      <nav className="hidden md:flex w-72 border-r border-outline-variant bg-surface-container-lowest flex-col shrink-0">
        <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant">
          <span className="font-bold text-on-surface-variant text-[11px] uppercase tracking-widest">Direct Messages</span>
          <button
            onClick={() => setNewConvOpen((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        {newConvOpen && (
          <div className="p-3 border-b border-outline-variant space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-9 pr-3 py-2 bg-surface-container-high border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline-variant outline-none focus:border-primary"
              />
              <button onClick={() => { setNewConvOpen(false); setSearchQuery(""); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-surface-container-higher text-on-surface-variant">
                <X size={14} />
              </button>
            </div>
            {searching && <p className="text-sm text-on-surface-variant">Searching...</p>}
            {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <p className="text-sm text-on-surface-variant">No users found</p>
            )}
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => { handleStartConversation(user.id); setConvListOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors text-left"
              >
                <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden shrink-0">
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
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {conversations.length === 0 && !newConvOpen && (
            <div className="p-4 text-center text-sm text-on-surface-variant">
              <MessageCircle size={24} className="mx-auto mb-2 opacity-50" />
              <p>No conversations yet</p>
              <p className="text-xs mt-1">Click + to start a new one</p>
            </div>
          )}
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => navigate(`/dm/${conv.id}`)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                conversationId === conv.id
                  ? "bg-primary-container text-on-primary-container"
                  : "hover:bg-surface-container-high text-on-surface-variant"
              )}
            >
              <div className="relative shrink-0">
                <div className="w-9 h-9 rounded-full bg-surface-container-higher overflow-hidden">
                  {conv.otherUser?.image ? (
                    <img src={conv.otherUser.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-label-md bg-surface-variant text-on-surface-variant">
                      {(conv.otherUser?.name ?? "?").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                {conv.otherUser && onlineUserIds.includes(conv.otherUser.id) && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-surface-container" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={cn("text-sm truncate", conversationId === conv.id ? "font-semibold text-on-primary-container" : "font-medium text-on-surface", conv.unreadCount > 0 && "font-bold")}>
                    {conv.otherUser?.name ?? "Unknown"}
                  </p>
                  {conv.unreadCount > 0 && (
                    <span className="shrink-0 min-w-[1.25rem] h-5 px-1 rounded-full bg-primary text-[10px] font-bold text-on-primary flex items-center justify-center">
                      {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                    </span>
                  )}
                </div>
                {conv.lastMessage && (
                  <p className={cn("text-xs truncate", conv.unreadCount > 0 ? "text-on-surface font-medium" : "text-on-surface-variant")}>
                    {conv.lastMessage.content}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile conversation list drawer */}
      {convListOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setConvListOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-surface-container-lowest border-r border-outline-variant animate-slide-in flex flex-col z-50">
            <div className="h-16 px-4 flex items-center justify-between border-b border-outline-variant">
              <span className="font-bold text-on-surface-variant text-[11px] uppercase tracking-widest">Direct Messages</span>
              <button
                onClick={() => setConvListOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => { navigate(`/dm/${conv.id}`); setConvListOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left",
                    conversationId === conv.id
                      ? "bg-primary-container text-on-primary-container"
                      : "hover:bg-surface-container-high text-on-surface-variant"
                  )}
                >
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-surface-container-higher overflow-hidden">
                      {conv.otherUser?.image ? (
                        <img src={conv.otherUser.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-label-md bg-surface-variant text-on-surface-variant">
                          {(conv.otherUser?.name ?? "?").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {conv.otherUser && onlineUserIds.includes(conv.otherUser.id) && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-surface-container" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm truncate", conversationId === conv.id ? "font-semibold text-on-primary-container" : "font-medium text-on-surface")}>
                      {conv.otherUser?.name ?? "Unknown"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col bg-surface-container overflow-hidden min-w-0">
        {selectedConversation ? (
          <ConversationView
            key={conversationId}
            conversation={selectedConversation}
            conversationId={conversationId!}
            currentUserId={currentUserId}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-on-surface-variant">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-body-md text-body-md">Select a conversation</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConversationView({
  conversation,
  conversationId,
  currentUserId,
}: {
  conversation: Conversation;
  conversationId: string;
  currentUserId: string | null;
}) {
  const onlineUserIds = useAppSelector((s) => s.presence.onlineUserIds);
  const [loadMessages, { isLoading: initialLoading }] = useLazyGetDMMessagesQuery();
  const [messages, setMessages] = useState<DMMessage[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [text, setText] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [markRead] = useMarkConversationReadMutation();
  const [deleteConversation] = useDeleteConversationMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [updateDMMessage] = useUpdateDMMessageMutation();
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const hasInitiallyLoaded = useRef(false);

  useEffect(() => {
    if (!conversationId) return;
    setMessages([]);
    setCursor(null);
    setHasMore(true);
    hasInitiallyLoaded.current = false;
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || hasInitiallyLoaded.current) return;
    hasInitiallyLoaded.current = true;
    loadMessages({ conversationId, limit: 50 }).then((res) => {
      if (res.data) {
        setMessages(res.data.messages);
        setCursor(res.data.nextCursor);
        setHasMore(res.data.hasMore);
      }
    });
  }, [conversationId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      markRead(conversationId);
    }
  }, [conversationId, markRead]);

  const loadEarlier = useCallback(async () => {
    if (!conversationId || !cursor || loadingMore) return;
    setLoadingMore(true);
    const container = messagesContainerRef.current;
    const prevScrollHeight = container?.scrollHeight ?? 0;

    const res = await loadMessages({ conversationId, cursor, limit: 50 });
    if (res.data) {
      setMessages((prev) => [...res.data!.messages, ...prev]);
      setCursor(res.data.nextCursor);
      setHasMore(res.data.hasMore);
    }
    setLoadingMore(false);

    requestAnimationFrame(() => {
      if (container) {
        container.scrollTop = container.scrollHeight - prevScrollHeight;
      }
    });
  }, [conversationId, cursor, loadingMore, loadMessages]);

  useEffect(() => {
    const socket = getSocket();
    const handler = (message: DMMessage) => {
      if (message.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
        dispatch(dmApi.util.updateQueryData("getDMMessages", { conversationId }, (draft) => {
          if (!draft.messages.find((m) => m.id === message.id)) {
            draft.messages.push(message);
          }
        }));
      }

      dispatch(dmApi.util.updateQueryData("getConversations", undefined, (draft) => {
        const conv = draft.find((c) => c.id === message.conversationId);
        if (conv) {
          conv.lastMessage = { id: message.id, content: message.content, senderId: message.senderId, createdAt: message.createdAt, sender: message.sender };
          if (message.senderId !== currentUserId && message.conversationId !== conversationId) {
            conv.unreadCount = (conv.unreadCount || 0) + 1;
          }
        }
      }));
    };
    socket.on("new:dm", handler);
    return () => {
      socket.off("new:dm", handler);
    };
  }, [conversationId, currentUserId, dispatch]);

  useEffect(() => {
    const socket = getSocket();
    const handler = (data: { conversationId: string }) => {
      if (data.conversationId === conversationId) {
        navigate("/dm");
      }
    };
    socket.on("conversation:deleted", handler);
    return () => {
      socket.off("conversation:deleted", handler);
    };
  }, [conversationId, navigate]);

  useEffect(() => {
    const socket = getSocket();
    const handler = (data: { conversationId: string; messageId: string }) => {
      if (data.conversationId === conversationId) {
        setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
        dispatch(dmApi.util.updateQueryData("getDMMessages", { conversationId }, (draft) => {
          const idx = draft.messages.findIndex((m) => m.id === data.messageId);
          if (idx !== -1) draft.messages.splice(idx, 1);
        }));
      }
    };
    socket.on("dm:deleted", handler);
    return () => {
      socket.off("dm:deleted", handler);
    };
  }, [conversationId, dispatch]);

  const handleSend = useCallback(() => {
    if (!text.trim() || !conversationId) return;
    getSocket().emit("send:dm", { conversationId, content: text });
    setText("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    if (isTypingRef.current) {
      getSocket().emit("typing:stop", { conversationId, toUserId: conversation.otherUser?.id });
      isTypingRef.current = false;
    }
  }, [text, conversationId, conversation.otherUser?.id]);

  const handleEdit = async (msgId: string) => {
    if (!editContent.trim()) return;
    await updateDMMessage({ conversationId, messageId: msgId, content: editContent });
    setEditingMessageId(null);
    setEditContent("");
  };

  const handleDelete = (msgId: string) => {
    getSocket().emit("delete:dm", { conversationId, messageId: msgId });
    setDeletingMessageId(null);
  };

  const handleTextChange = (value: string) => {
    setText(value);
    if (!conversationId || !conversation.otherUser?.id) return;
    if (!isTypingRef.current && value.trim()) {
      getSocket().emit("typing:start", { conversationId, toUserId: conversation.otherUser.id });
      isTypingRef.current = true;
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isTypingRef.current) {
        getSocket().emit("typing:stop", { conversationId, toUserId: conversation.otherUser?.id });
        isTypingRef.current = false;
      }
    }, 2000);
  };

  return (
    <>
      <header className="h-16 px-4 md:px-6 border-b border-outline-variant flex items-center gap-3 bg-surface/50 shrink-0">
        <button
          onClick={() => setConvListOpen(true)}
          className="md:hidden p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors shrink-0"
          aria-label="Show conversations"
        >
          <Menu size={20} />
        </button>
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-full bg-surface-container-higher overflow-hidden">
            {conversation.otherUser?.image ? (
              <img src={conversation.otherUser.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-label-md bg-surface-variant text-on-surface-variant">
                {(conversation.otherUser?.name ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          {conversation.otherUser && onlineUserIds.includes(conversation.otherUser.id) && (
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-surface-container" />
          )}
        </div>
        <div>
          <h2 className="font-bold text-sm text-on-surface">{conversation.otherUser?.name ?? "Unknown"}</h2>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {conversation.otherUser && (
            <VideoCallButton
              otherUserId={conversation.otherUser.id}
              otherUserName={conversation.otherUser.name}
              otherUserImage={conversation.otherUser.image}
              conversationId={conversationId}
            />
          )}
          <button
            onClick={() => setConfirmDeleteOpen(true)}
            className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-error transition-colors"
            title="Delete conversation"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      <Modal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete conversation"
      >
        <div className="space-y-4">
          <p className="text-sm text-on-surface-variant">
            Are you sure you want to delete this conversation with <strong className="text-on-surface">{conversation.otherUser?.name}</strong>? All messages will be permanently removed.
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setConfirmDeleteOpen(false)}
              className="px-4 py-2 rounded-lg border border-outline-variant text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                await deleteConversation(conversationId);
                setConfirmDeleteOpen(false);
                navigate("/dm");
              }}
              className="px-4 py-2 rounded-lg bg-error text-on-error text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

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

      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {initialLoading ? (
          <div className="flex items-center justify-center h-full text-on-surface-variant">
            <p className="font-body-md">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-on-surface-variant">
            <div className="text-center">
              <MessageCircle size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-body-md text-body-md">No messages yet</p>
              <p className="text-label-sm mt-1">Say hello to start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {hasMore && (
              <div className="flex justify-center">
                <button
                  onClick={loadEarlier}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors disabled:opacity-50"
                >
                  <ChevronUp size={16} />
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
                          onClick={() => { setEditingMessageId(msg.id); setEditContent(msg.content); }}
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
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-surface-container">
        <TypingIndicator conversationId={conversationId} />
        <div className="flex items-end gap-3 bg-surface-container-low border border-outline-variant rounded-xl px-4 py-3 focus-within:border-primary transition-colors">
          <textarea
            value={text}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={`Message ${conversation.otherUser?.name ?? "user"}...`}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-on-surface placeholder:text-outline-variant resize-none outline-none min-h-[2.5rem] max-h-[12rem]"
            rows={1}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button
            type="button"
            onClick={handleSend}
            className="p-2 bg-primary text-on-primary rounded-lg hover:opacity-90 transition-opacity shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </>
  );
}

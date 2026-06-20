import { baseApi } from "../../../../app/baseApi";

export type Conversation = {
  id: string;
  otherUser: { id: string; name: string; image: string | null } | null;
  lastMessage: {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: { id: string; name: string; image: string | null };
  } | null;
  createdAt: string;
  updatedAt: string;
  unreadCount: number;
};

export type DMMessage = {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  createdAt: string;
  isEdited?: boolean;
  sender: { id: string; name: string; image: string | null };
};

export const dmApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getConversations: build.query<Conversation[], void>({
      query: () => ({ url: "/dm/conversations", method: "GET" }),
      providesTags: ["Conversations"],
    }),
    createConversation: build.mutation<Conversation, { participantId: string }>({
      query: (body) => ({
        url: "/dm/conversations",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Conversations"],
    }),
    getConversation: build.query<Conversation, string>({
      query: (id) => ({ url: `/dm/conversations/${id}`, method: "GET" }),
      providesTags: (_result, _error, id) => [{ type: "Conversation" as const, id }],
    }),
    getDMMessages: build.query<
      { messages: DMMessage[]; nextCursor: string | null; hasMore: boolean },
      { conversationId: string; cursor?: string; limit?: number }
    >({
      query: ({ conversationId, cursor, limit }) => ({
        url: `/dm/conversations/${conversationId}/messages`,
        method: "GET",
        params: { cursor, limit: limit ?? 50 },
      }),
      serializeQueryArgs: ({ queryArgs: { conversationId } }) => `DMMessages-${conversationId}`,
      merge: (currentCache, newData, { arg }) => {
        if (!arg.cursor) return newData;
        return {
          messages: [...newData.messages, ...currentCache.messages],
          nextCursor: newData.nextCursor,
          hasMore: newData.hasMore,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      transformResponse: (raw: { data: DMMessage[]; meta: { nextCursor: string | null; hasMore: boolean } }) => ({
        messages: raw.data,
        nextCursor: raw.meta.nextCursor ?? null,
        hasMore: raw.meta.hasMore,
      }),
      providesTags: (_result, _error, { conversationId }) => [{ type: "DMMessages" as const, id: conversationId }],
    }),
    markConversationRead: build.mutation<void, string>({
      query: (conversationId) => ({
        url: `/dm/conversations/${conversationId}/read`,
        method: "PUT",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Conversation" as const, id },
        "Conversations",
      ],
    }),
    updateDMMessage: build.mutation<{ message: DMMessage }, { conversationId: string; messageId: string; content: string }>({
      query: ({ conversationId, messageId, content }) => ({
        url: `/dm/conversations/${conversationId}/messages/${messageId}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: (_result, _error, { conversationId }) => [{ type: "DMMessages" as const, id: conversationId }],
    }),
    deleteConversation: build.mutation<void, string>({
      query: (id) => ({
        url: `/dm/conversations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Conversations"],
    }),
  }),
});

export const {
  useGetConversationsQuery,
  useCreateConversationMutation,
  useGetConversationQuery,
  useGetDMMessagesQuery,
  useLazyGetDMMessagesQuery,
  useMarkConversationReadMutation,
  useUpdateDMMessageMutation,
  useDeleteConversationMutation,
} = dmApi;

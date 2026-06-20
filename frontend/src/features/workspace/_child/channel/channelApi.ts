import { baseApi } from "../../../../app/baseApi";

export type CreateChannelPayload = {
  name: string;
  description?: string;
  type: "PUBLIC" | "PRIVATE";
  isArchived: boolean;
};

type Channel = {
  id: string;
  name: string;
  description: string | null;
  type: "PUBLIC" | "PRIVATE";
  isArchived: boolean;
  createdById: string;
  _count: { members: number };
};

export type ChannelMember = {
  id: string;
  channelId: string;
  userId: string;
  role: "OWNER" | "MODERATOR" | "MEMBER";
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

export type Message = {
  id: string;
  content: string;
  channelId: string;
  senderId: string;
  createdAt: string;
  isEdited?: boolean;
  sender: {
    id: string;
    name: string;
    image: string | null;
  };
};

export type ChannelInvite = {
  id: string;
  channelId: string;
  invitedUserId: string;
  invitedByUserId: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  channel?: {
    id: string;
    name: string;
    type: "PUBLIC" | "PRIVATE";
  };
  invitedBy?: {
    id: string;
    name: string;
    image: string | null;
  };
};

type UserSearchResult = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  hasPendingRequest: boolean;
};

export const channelApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getChannels: build.query<Channel[], void>({
      query: () => ({ url: "/channel", method: "GET" }),
      transformResponse: (res: { data: Channel[] }) => res.data,
      providesTags: ["Channels"],
    }),
    getChannel: build.query<Channel, string>({
      query: (name) => ({ url: `/channel/${name}`, method: "GET" }),
    }),
    postChannel: build.mutation<Channel, CreateChannelPayload>({
      query: (channelData) => ({ url: "/channel", method: "POST", body: channelData }),
      invalidatesTags: ["Channels"],
    }),
    getMessages: build.query<
      { messages: Message[]; nextCursor: string | null; hasMore: boolean },
      { channelId: string; cursor?: string; limit?: number }
    >({
      query: ({ channelId, cursor, limit }) => ({
        url: `/channel/${channelId}/messages`,
        method: "GET",
        params: { cursor, limit: limit ?? 50 },
      }),
      serializeQueryArgs: ({ queryArgs: { channelId } }) => `Messages-${channelId}`,
      merge: (currentCache, newData, { arg }) => {
        if (!arg.cursor) return newData;
        return {
          messages: [...newData.messages, ...currentCache.messages],
          nextCursor: newData.nextCursor,
          hasMore: newData.hasMore,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      transformResponse: (raw: { data: Message[]; meta: { nextCursor: string | null; hasMore: boolean } }) => ({
        messages: raw.data,
        nextCursor: raw.meta.nextCursor ?? null,
        hasMore: raw.meta.hasMore,
      }),
      providesTags: (_result, _error, { channelId }) => [{ type: "Messages" as const, id: channelId }],
    }),
    updateMessage: build.mutation<{ message: Message }, { channelId: string; messageId: string; content: string }>({
      query: ({ channelId, messageId, content }) => ({
        url: `/channel/${channelId}/messages/${messageId}`,
        method: "PUT",
        body: { content },
      }),
      invalidatesTags: (_result, _error, { channelId }) => [{ type: "Messages" as const, id: channelId }],
    }),
    getChannelMembers: build.query<ChannelMember[], string>({
      query: (channelId) => ({ url: `/channel/${channelId}/members`, method: "GET" }),
      transformResponse: (res: { data: ChannelMember[] }) => res.data,
      providesTags: (_result, _error, channelId) => [{ type: "ChannelMembers" as const, id: channelId }],
    }),
    addChannelMember: build.mutation<ChannelMember, { channelId: string; userId: string; role?: "OWNER" | "MODERATOR" | "MEMBER" }>({
      query: ({ channelId, userId, role }) => ({
        url: `/channel/${channelId}/members`,
        method: "POST",
        body: { userId, role: role ?? "MEMBER" },
      }),
      invalidatesTags: (_result, _error, { channelId }) => [
        { type: "ChannelMembers" as const, id: channelId },
        "Channels",
      ],
    }),
    removeChannelMember: build.mutation<void, { channelId: string; userId: string }>({
      query: ({ channelId, userId }) => ({
        url: `/channel/${channelId}/members/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { channelId }) => [
        { type: "ChannelMembers" as const, id: channelId },
        "Channels",
      ],
    }),
    searchUsers: build.query<UserSearchResult[], string>({
        query: (q) => ({ url: `/user/search?query=${encodeURIComponent(q)}`, method: "GET" }),
      transformResponse: (res: { data: UserSearchResult[] }) => res.data,
    }),
    updateChannel: build.mutation<Channel, { id: string } & Partial<CreateChannelPayload>>({
      query: ({ id, ...body }) => ({ url: `/channel/${id}`, method: "PUT", body }),
      invalidatesTags: ["Channels"],
    }),
    deleteChannel: build.mutation<void, string>({
      query: (channelId) => ({ url: `/channel/${channelId}`, method: "DELETE" }),
      invalidatesTags: ["Channels"],
    }),

    // Invite endpoints
    inviteUserToChannel: build.mutation<ChannelInvite, { channelId: string; userId: string }>({
      query: ({ channelId, userId }) => ({
        url: `/channel/${channelId}/invite`,
        method: "POST",
        body: { userId },
      }),
      invalidatesTags: (_result, _error, { channelId }) => [
        { type: "ChannelInvites" as const, id: channelId },
      ],
    }),
    getPendingInvites: build.query<ChannelInvite[], void>({
      query: () => ({ url: "/channel/invites/pending", method: "GET" }),
      transformResponse: (res: { data: ChannelInvite[] }) => res.data,
      providesTags: ["ChannelInvites"],
    }),
    acceptInvite: build.mutation<Channel, string>({
      query: (inviteId) => ({
        url: `/channel/invites/${inviteId}/accept`,
        method: "POST",
      }),
      invalidatesTags: ["ChannelInvites", "Channels"],
    }),
    declineInvite: build.mutation<{ message: string }, string>({
      query: (inviteId) => ({
        url: `/channel/invites/${inviteId}/reject`,
        method: "POST",
      }),
      invalidatesTags: ["ChannelInvites"],
    }),
  }),
});

export const {
  useGetChannelsQuery,
  useGetChannelQuery,
  usePostChannelMutation,
  useGetMessagesQuery,
  useLazyGetMessagesQuery,
  useUpdateMessageMutation,
  useGetChannelMembersQuery,
  useAddChannelMemberMutation,
  useRemoveChannelMemberMutation,
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
  useInviteUserToChannelMutation,
  useGetPendingInvitesQuery,
  useAcceptInviteMutation,
  useDeclineInviteMutation,
} = channelApi;

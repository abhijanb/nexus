import { baseApi } from "../../../../app/baseApi";

export type FriendUser = {
  id: string;
  name: string;
  image: string | null;
};

export const friendApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFriends: build.query<FriendUser[], void>({
      query: () => ({ url: "/friends", method: "GET" }),
      providesTags: ["Friends"],
    }),
    addFriend: build.mutation<void, string>({
      query: (friendId) => ({ url: "/friends", method: "POST", body: { friendId } }),
      invalidatesTags: ["Friends"],
    }),
    removeFriend: build.mutation<void, string>({
      query: (friendId) => ({ url: `/friends/${friendId}`, method: "DELETE" }),
      invalidatesTags: ["Friends"],
    }),

    // Friend request endpoints
    getPendingFriendRequests: build.query<{ id: string; user: { id: string; name: string; image: string | null }; createdAt: string }[], void>({
      query: () => ({ url: "/friends/pending", method: "GET" }),
      providesTags: ["Friends"],
    }),
    acceptFriendRequest: build.mutation<void, string>({
      query: (requestId) => ({ url: `/friends/${requestId}/accept`, method: "POST" }),
      invalidatesTags: ["Friends", "Notifications"],
    }),
    rejectFriendRequest: build.mutation<void, string>({
      query: (requestId) => ({ url: `/friends/${requestId}/reject`, method: "POST" }),
      invalidatesTags: ["Friends"],
    }),
  }),
});

export const {
  useGetFriendsQuery,
  useAddFriendMutation,
  useRemoveFriendMutation,
  useGetPendingFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
} = friendApi;

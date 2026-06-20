export {
  type CreateChannelPayload,
  type ChannelMember,
  type Message,
  type ChannelInvite,
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
} from "./_child/channel/channelApi";

export {
  type Conversation,
  type DMMessage,
  useGetConversationsQuery,
  useCreateConversationMutation,
  useGetConversationQuery,
  useGetDMMessagesQuery,
  useLazyGetDMMessagesQuery,
  useMarkConversationReadMutation,
  useUpdateDMMessageMutation,
  useDeleteConversationMutation,
} from "./_child/dm/dmApi";

export {
  type FriendUser,
  useGetFriendsQuery,
  useAddFriendMutation,
  useRemoveFriendMutation,
  useGetPendingFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
} from "./_child/friend/friendApi";

export {
  type TaskItem,
  type CreateTaskPayload,
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "./_child/tasks/tasksApi";

export {
  type NotificationItem,
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useBulkMarkNotificationsReadMutation,
  useBulkDeleteNotificationsMutation,
  useGetUnreadNotificationCountQuery,
} from "./pages/notificationApi";

export {
  type FileRecord,
  useGetFilesQuery,
  useGetFileQuery,
  useDeleteFileMutation,
  useUploadFilesMutation,
  useUploadImageMutation,
} from "./pages/uploadApi";

import { baseApi } from "../../app/baseApi";

export const { useUpdateProfileMutation } = baseApi.injectEndpoints({
  endpoints: (build) => ({
    updateProfile: build.mutation<{ id: string; name: string; image: string | null }, { name?: string; image?: string | null }>({
      query: (body) => ({ url: "/user/profile", method: "PUT", body }),
    }),
  }),
});

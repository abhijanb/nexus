import { baseApi } from "../../../app/baseApi";

export type NotificationItem = {
  id: string;
  userId: string;
  type: "CHANNEL_INVITE" | "TASK_ASSIGNED" | "MENTION" | "SYSTEM";
  title: string;
  body: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
};

export type NotificationPreferences = {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  channelInvites: boolean;
  taskAssignments: boolean;
};

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getNotifications: build.query<
      { data: NotificationItem[]; meta: { nextCursor: string | null; hasMore: boolean } },
      { unreadOnly?: boolean; limit?: number; cursor?: string }
    >({
      query: ({ cursor, ...rest }) => ({
        url: "/notifications",
        method: "GET",
        params: { ...rest, cursor },
      }),
      serializeQueryArgs: ({ queryArgs: { unreadOnly } }) => `Notifications-${unreadOnly ?? "all"}`,
      merge: (currentCache, newData, { arg }) => {
        if (!arg.cursor) return newData;
        return {
          data: [...currentCache.data, ...newData.data],
          meta: newData.meta,
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.cursor !== previousArg?.cursor,
      providesTags: ["Notifications"],
    }),
    markNotificationRead: build.mutation<NotificationItem, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}/read`,
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
    }),
    markAllNotificationsRead: build.mutation<void, void>({
      query: () => ({
        url: "/notifications/mark-all-read",
        method: "POST",
      }),
      invalidatesTags: ["Notifications"],
    }),
    deleteNotification: build.mutation<void, string>({
      query: (notificationId) => ({
        url: `/notifications/${notificationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notifications"],
    }),
    bulkMarkNotificationsRead: build.mutation<void, string[]>({
      query: (ids) => ({
        url: "/notifications/bulk-read",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: ["Notifications"],
    }),
    bulkDeleteNotifications: build.mutation<void, string[]>({
      query: (ids) => ({
        url: "/notifications/bulk-delete",
        method: "POST",
        body: { ids },
      }),
      invalidatesTags: ["Notifications"],
    }),
    getUnreadNotificationCount: build.query<{ count: number }, void>({
      query: () => ({ url: "/notifications/unread-count", method: "GET" }),
      providesTags: ["Notifications"],
    }),
    getNotificationPreferences: build.query<NotificationPreferences, void>({
      query: () => ({ url: "/notifications/preferences", method: "GET" }),
      providesTags: ["NotificationPreferences"],
    }),
    updateNotificationPreferences: build.mutation<NotificationPreferences, Partial<NotificationPreferences>>({
      query: (body) => ({
        url: "/notifications/preferences",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["NotificationPreferences"],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useLazyGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useBulkMarkNotificationsReadMutation,
  useBulkDeleteNotificationsMutation,
  useGetUnreadNotificationCountQuery,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
} = notificationApi;

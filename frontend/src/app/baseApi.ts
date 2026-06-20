import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";

const rawBaseQuery = fetchBaseQuery({
    baseUrl: `${import.meta.env.VITE_API_BASE_URL}/api`,
    credentials: "include",
});

const customBaseQuery: BaseQueryFn<FetchArgs, unknown, FetchBaseQueryError> = async (
    args,
    api,
    extraOptions,
) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    if (result.error) return { error: result.error };
    if (result.data === null || result.data === undefined) return { data: undefined as never };
    return { data: (result.data as { data: unknown }).data as never };
};

export const baseApi = createApi({
    reducerPath: "baseApi",
    baseQuery: customBaseQuery,
    tagTypes: [
        "Channels", "Messages", "ChannelInvites", "Conversations",
        "Conversation", "DMMessages", "Notifications", "NotificationPreferences",
        "Tasks", "Files", "ChannelMembers", "Friends",
    ],
    endpoints: () => ({}),
});

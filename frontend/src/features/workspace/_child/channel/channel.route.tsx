import type { RouteObject } from "react-router-dom";

export const channelRoutes: RouteObject[] = [
    {
        index: true,
        lazy: () => import("./pages/ChannelsPage").then(m => ({ Component: m.default })),
    },
    {
        path: "create",
        lazy: () => import("./pages/CreateChannelPage").then(m => ({ Component: m.default })),
    },
    {
        path: ":channelName",
        lazy: () => import("./pages/ChannelPage").then(m => ({ Component: m.default })),
    },
]
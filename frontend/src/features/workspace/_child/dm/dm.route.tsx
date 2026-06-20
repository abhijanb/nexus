import type { RouteObject } from "react-router-dom";

export const dmRoutes: RouteObject[] = [
    {
        index: true,
        lazy: () => import("./pages/DMPage").then(m => ({ Component: m.default })),
    },
    {
        path: ":conversationId",
        lazy: () => import("./pages/DMPage").then(m => ({ Component: m.default })),
    },
];

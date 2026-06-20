import type { RouteObject } from "react-router-dom";

export const tasksRoutes: RouteObject[] = [
    {
        index: true,
        lazy: () => import("./pages/TasksPage").then(m => ({ Component: m.default })),
    },
    {
        path: "create",
        lazy: () => import("./pages/CreateTaskPage").then(m => ({ Component: m.default })),
    },
];

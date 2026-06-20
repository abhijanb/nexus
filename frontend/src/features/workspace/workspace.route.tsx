import { ProtectedRoute } from "../../shared/components/ProtectedRoute";
import { AppLayout } from "../../shared/components/AppLayout";
import { channelRoutes } from "./_child/channel/channel.route";
import { dmRoutes } from "./_child/dm/dm.route";
import { tasksRoutes } from "./_child/tasks/tasks.route";
import { friendRoutes } from "./_child/friend/friend.route";

export const workspaceRoutes = [
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            lazy: () => import("./pages/DashboardPage").then(m => ({ Component: m.default })),
          },
          {
            path: "/channels",
            children: channelRoutes,
          },
          {
            path: "/dm",
            children: dmRoutes,
          },
          {
            path: "/tasks",
            children: tasksRoutes,
          },
          {
            path: "/friends",
            children: friendRoutes,
          },
          {
            path: "/files",
            lazy: () => import("./pages/FilesPage").then(m => ({ Component: m.default })),
          },
          {
            path: "/settings",
            lazy: () => import("../settings/SettingsPage").then(m => ({ Component: m.default })),
          },
          {
            path: "/search",
            lazy: () => import("./pages/GlobalSearchResultPage").then(m => ({ Component: m.default })),
          },
          {
            path: "/notifications",
            lazy: () => import("./pages/NotificationsPage").then(m => ({ Component: m.default })),
          },
          {
            path: "*",
            lazy: () => import("./pages/NotFoundPage").then(m => ({ Component: m.default })),
          },
        ],
      },
    ],
  },
];

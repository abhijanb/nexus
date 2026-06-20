import type { RouteObject } from "react-router-dom";

export const friendRoutes: RouteObject[] = [
  {
    index: true,
    lazy: () => import("./pages/FriendsPage").then(m => ({ Component: m.default })),
  },
];

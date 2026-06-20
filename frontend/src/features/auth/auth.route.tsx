import type { RouteObject } from "react-router-dom";
import { PublicRoute } from "../../shared/components/PublicRoute";

export const authRoute: RouteObject[] = [
    {
        path: "login",
        element: <PublicRoute />,
        children: [
            {
                index: true,
                lazy: () => import("./pages/login.page"),
            },
        ],
    },
];

import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { bulkDelete, bulkMarkRead, deleteNotification, getNotificationPreferences, getUnreadNotificationCount, listNotifications, markAllNotificationsRead, markNotificationRead, updateNotificationPreferences } from "./controller";

const notificationRoutes: Router = Router();
notificationRoutes.use(authenticate);

notificationRoutes.get("/", listNotifications);
notificationRoutes.get("/preferences", getNotificationPreferences);
notificationRoutes.put("/preferences", updateNotificationPreferences);
notificationRoutes.get("/unread-count", getUnreadNotificationCount);
notificationRoutes.post("/mark-all-read", markAllNotificationsRead);
notificationRoutes.post("/bulk-read", bulkMarkRead);
notificationRoutes.post("/bulk-delete", bulkDelete);
notificationRoutes.post("/:id/read", markNotificationRead);
notificationRoutes.delete("/:id", deleteNotification);

export default notificationRoutes;

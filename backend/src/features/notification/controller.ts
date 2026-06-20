import type { RequestHandler } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validateOrThrow } from "../../utils/validate";
import { service } from "./service";
import { listNotificationsSchema, notificationIdSchema, notificationPreferencesSchema, bulkNotificationIdsSchema } from "./schema";
import { successResponse, cursorResponse } from "../../utils/response";

export const listNotifications: RequestHandler = asyncHandler(async (req, res) => {
    const query = validateOrThrow(listNotificationsSchema, req.query);
    const result = await service.list(req.user!.id, query);
    cursorResponse(res, result.notifications, { nextCursor: result.nextCursor, hasMore: result.hasMore }, "Notifications retrieved successfully");
});

export const markNotificationRead: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(notificationIdSchema, req.params);
    const notification = await service.markRead(req.user!.id, params.id);
    successResponse(res, notification, "Notification marked as read");
});

export const markAllNotificationsRead: RequestHandler = asyncHandler(async (req, res) => {
    await service.markAllRead(req.user!.id);
    successResponse(res, null, "All notifications marked as read");
});

export const deleteNotification: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(notificationIdSchema, req.params);
    await service.deleteNotification(req.user!.id, params.id);
    successResponse(res, null, "Notification deleted");
});

export const bulkMarkRead: RequestHandler = asyncHandler(async (req, res) => {
    const body = validateOrThrow(bulkNotificationIdsSchema, req.body);
    await service.bulkMarkRead(req.user!.id, body.ids);
    successResponse(res, null, "Notifications marked as read");
});

export const bulkDelete: RequestHandler = asyncHandler(async (req, res) => {
    const body = validateOrThrow(bulkNotificationIdsSchema, req.body);
    await service.bulkDelete(req.user!.id, body.ids);
    successResponse(res, null, "Notifications deleted");
});

export const getUnreadNotificationCount: RequestHandler = asyncHandler(async (req, res) => {
    const result = await service.unreadCount(req.user!.id);
    successResponse(res, result, "Unread count retrieved");
});

export const getNotificationPreferences: RequestHandler = asyncHandler(async (req, res) => {
    const prefs = await service.getPreferences(req.user!.id);
    successResponse(res, prefs, "Notification preferences retrieved");
});

export const updateNotificationPreferences: RequestHandler = asyncHandler(async (req, res) => {
    const data = validateOrThrow(notificationPreferencesSchema, req.body);
    const prefs = await service.updatePreferences(req.user!.id, data);
    successResponse(res, prefs, "Notification preferences updated");
});

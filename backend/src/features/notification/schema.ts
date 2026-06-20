import { z } from "zod";

export const listNotificationsSchema = z.object({
    unreadOnly: z.coerce.boolean().optional(),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    cursor: z.string().optional(),
});

export type ListNotificationsQuery = z.infer<typeof listNotificationsSchema>;

export const notificationIdSchema = z.object({
    id: z.string().min(1),
});

export const bulkNotificationIdsSchema = z.object({
    ids: z.array(z.string().min(1)).min(1).max(100),
});

export const notificationPreferencesSchema = z.object({
    emailNotifications: z.boolean().optional(),
    inAppNotifications: z.boolean().optional(),
    channelInvites: z.boolean().optional(),
    taskAssignments: z.boolean().optional(),
});

export type NotificationPreferencesInput = z.infer<typeof notificationPreferencesSchema>;
export type NotificationPreferences = Required<NotificationPreferencesInput>;

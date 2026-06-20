import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { Errors } from "../../utils/errorMessages";
import type { ListNotificationsQuery, NotificationPreferencesInput } from "./schema";

const defaultPrefs = {
    emailNotifications: true,
    inAppNotifications: true,
    channelInvites: true,
    taskAssignments: true,
} as const;

class Service {
    async list(userId: string, query: ListNotificationsQuery) {
        const { unreadOnly, limit, cursor } = query;
        const where = {
            userId,
            ...(unreadOnly && { isRead: false }),
            ...(cursor ? { id: { lt: cursor } } : {}),
        };

        const notifications = await prisma.notification.findMany({
            where,
            take: limit + 1,
            orderBy: { id: "desc" },
        });

        const hasMore = notifications.length > limit;
        const result = hasMore ? notifications.slice(0, limit) : notifications;
        const nextCursor = result.at(-1)?.id ?? null;

        return { notifications: result, nextCursor, hasMore };
    }

    async markRead(userId: string, notificationId: string) {
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });
        if (!notification) throw new AppError(Errors.NOTIFICATION_NOT_FOUND, 404);

        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
        return updated;
    }

    async markAllRead(userId: string) {
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
    }

    async deleteNotification(userId: string, notificationId: string) {
        await prisma.notification.deleteMany({
            where: { id: notificationId, userId },
        });
    }

    async bulkMarkRead(userId: string, ids: string[]) {
        await prisma.notification.updateMany({
            where: { id: { in: ids }, userId },
            data: { isRead: true },
        });
    }

    async bulkDelete(userId: string, ids: string[]) {
        await prisma.notification.deleteMany({
            where: { id: { in: ids }, userId },
        });
    }

    async unreadCount(userId: string) {
        const count = await prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }

    async getPreferences(userId: string) {
        const prefs = await prisma.notificationPreference.findUnique({
            where: { userId },
        });
        return prefs ?? { userId, ...defaultPrefs };
    }

    async updatePreferences(userId: string, data: NotificationPreferencesInput) {
        const prefs = await prisma.notificationPreference.upsert({
            where: { userId },
            create: {
                userId,
                emailNotifications: data.emailNotifications ?? true,
                inAppNotifications: data.inAppNotifications ?? true,
                channelInvites: data.channelInvites ?? true,
                taskAssignments: data.taskAssignments ?? true,
            },
            update: {
                ...(data.emailNotifications !== undefined && { emailNotifications: data.emailNotifications }),
                ...(data.inAppNotifications !== undefined && { inAppNotifications: data.inAppNotifications }),
                ...(data.channelInvites !== undefined && { channelInvites: data.channelInvites }),
                ...(data.taskAssignments !== undefined && { taskAssignments: data.taskAssignments }),
            },
        });
        return prefs;
    }
}

export const service = new Service();

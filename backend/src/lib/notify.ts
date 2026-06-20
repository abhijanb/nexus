import { prisma } from "./prisma";
import { sendEmail } from "./mail";
import { env } from "../config/env";
import { getIO } from "./socket";

type NotifyOptions = {
    userId: string;
    type: string;
    title: string;
    body?: string | null;
    link?: string | null;
    email?: boolean;
};

function typeToPref(type: string): keyof typeof defaultPrefs | null {
    switch (type) {
        case "CHANNEL_INVITE": return "channelInvites";
        case "TASK_ASSIGNED": return "taskAssignments";
        default: return null;
    }
}

const defaultPrefs = {
    emailNotifications: true,
    inAppNotifications: true,
    channelInvites: true,
    taskAssignments: true,
};

export async function notify(options: NotifyOptions) {
    const { userId, type, title, body, link, email } = options;

    const prefs = await prisma.notificationPreference.findUnique({
        where: { userId },
    });

    const userPrefs = prefs ?? defaultPrefs;

    const typePref = typeToPref(type);
    const channelAllowed = typePref ? userPrefs[typePref] : true;

    if (userPrefs.inAppNotifications && channelAllowed) {
        const notification = await prisma.notification.create({
            data: {
                userId,
                type,
                title,
                body: body ?? null,
                link: link ?? null,
            },
        });

        try {
            const event: { id: string; type: string; title: string; body?: string; link?: string } = {
                id: notification.id,
                type: notification.type,
                title: notification.title,
            };
            if (notification.body) event.body = notification.body;
            if (notification.link) event.link = notification.link;
            getIO().to(`user:${userId}`).emit("notification:created", event);
        } catch {
            // socket not initialized yet
        }
    }

    if (email && userPrefs.emailNotifications && channelAllowed) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true },
        });

        if (user?.email) {
            await sendEmail(
                user.email,
                `Nexus: ${title}`,
                `${body ?? title}\n\n${link ? `${env.FRONTEND_URL}${link}` : ""}`
            );
        }
    }
}

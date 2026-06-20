import { prisma } from "../lib/prisma";
import { getIO } from "../lib/socket";

const CHECK_INTERVAL = 30_000;

function getNextRecurrence(rule: string, from: Date): Date {
    const d = new Date(from);
    switch (rule) {
        case "daily": d.setDate(d.getDate() + 1); break;
        case "weekdays": d.setDate(d.getDate() + 1); break;
        case "weekly": d.setDate(d.getDate() + 7); break;
        case "biweekly": d.setDate(d.getDate() + 14); break;
        case "monthly": d.setMonth(d.getMonth() + 1); break;
    }
    return d;
}

async function processReminders() {
    const now = new Date();

    const tasks = await prisma.task.findMany({
        where: {
            reminderAt: { lte: now },
            reminderNotifiedAt: null,
        },
        include: {
            assignees: { select: { userId: true } },
        },
    });

    for (const task of tasks) {
        const userIds = new Set<string>();
        userIds.add(task.createdById);
        for (const a of task.assignees) userIds.add(a.userId);

        for (const userId of userIds) {
            const notification = await prisma.notification.create({
                data: {
                    userId,
                    type: "TASK_REMINDER",
                    title: `Task "${task.title}" is due`,
                    body: task.dueDate
                        ? `Due: ${task.dueDate.toLocaleDateString()}`
                        : null,
                    link: `/tasks`,
                },
            });

            const io = getIO();
            const event: { id: string; type: string; title: string; body?: string } = {
                id: notification.id,
                type: notification.type,
                title: notification.title,
            };
            if (notification.body) event.body = notification.body;
            io.to(`user:${userId}`).emit("notification:created", event);
        }

        await prisma.task.update({
            where: { id: task.id },
            data: { reminderNotifiedAt: now },
        });
    }
}

async function processRecurrences() {
    const now = new Date();

    const tasks = await prisma.task.findMany({
        where: {
            recurrenceRule: { not: null },
            nextRecurrenceAt: { lte: now },
        },
        include: {
            assignees: { select: { userId: true } },
            labels: { select: { label: true } },
        },
    });

    for (const task of tasks) {
        if (!task.recurrenceRule || !task.nextRecurrenceAt) continue;

        const lastKey = await prisma.task.findFirst({ orderBy: { key: "desc" }, select: { key: true } });
        const num = lastKey ? parseInt(lastKey.key.replace("NEXUS-", ""), 10) + 1 : 1;
        const key = `NEXUS-${String(num).padStart(3, "0")}`;

        await prisma.task.create({
            data: {
                title: task.title,
                description: task.description,
                priority: task.priority,
                status: "backlog",
                storyPoints: task.storyPoints,
                channelId: task.channelId,
                dueDate: task.dueDate ? getNextRecurrence(task.recurrenceRule, task.dueDate) : null,
                reminderAt: null,
                recurrenceRule: task.recurrenceRule,
                key,
                createdById: task.createdById,
                ...(task.assignees.length
                    ? { assignees: { create: task.assignees.map((a) => ({ userId: a.userId })) } }
                    : {}),
                ...(task.labels.length
                    ? { labels: { create: task.labels.map((l) => ({ label: l.label })) } }
                    : {}),
            },
        });

        const nextDate = getNextRecurrence(task.recurrenceRule, task.nextRecurrenceAt);
        await prisma.task.update({
            where: { id: task.id },
            data: { nextRecurrenceAt: nextDate },
        });
    }
}

let intervalHandle: ReturnType<typeof setInterval> | null = null;

export function startTaskScheduler() {
    const check = async () => {
        try {
            await processReminders();
            await processRecurrences();
        } catch (err) {
            console.error("Task scheduler error:", err);
        }
    };

    check();
    intervalHandle = setInterval(check, CHECK_INTERVAL);
}

export function stopTaskScheduler() {
    if (intervalHandle) {
        clearInterval(intervalHandle);
        intervalHandle = null;
    }
}

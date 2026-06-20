import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { Errors } from "../../utils/errorMessages";
import type { Prisma } from "../../../generated/prisma/client";
import type { CreateTaskPayload, ListTasksQuery, UpdateTaskPayload } from "./schema";

class Service {
    async getNextKey(): Promise<string> {
        const last = await prisma.task.findFirst({ orderBy: { key: "desc" }, select: { key: true } });
        const num = last ? parseInt(last.key.replace("NEXUS-", ""), 10) + 1 : 1;
        return `NEXUS-${String(num).padStart(3, "0")}`;
    }

    async create(userId: string, payload: CreateTaskPayload) {
        const { assigneeIds, labels, recurrenceRule, ...data } = payload;
        const key = await this.getNextKey();

        const nextRecurrenceAt = recurrenceRule
            ? this.computeNextRecurrence(recurrenceRule, data.dueDate ? new Date(data.dueDate) : new Date())
            : null;

        const task = await prisma.task.create({
            data: {
                title: data.title,
                description: data.description ?? null,
                priority: data.priority ?? "medium",
                status: data.status ?? "backlog",
                storyPoints: data.storyPoints ?? null,
                channelId: data.channelId ?? null,
                dueDate: data.dueDate ? new Date(data.dueDate) : null,
                reminderAt: data.reminderAt ? new Date(data.reminderAt) : null,
                recurrenceRule: recurrenceRule ?? null,
                nextRecurrenceAt,
                key,
                createdById: userId,
                ...(assigneeIds?.length ? { assignees: { create: assigneeIds.map((uid) => ({ userId: uid })) } } : {}),
                ...(labels?.length ? { labels: { create: labels.map((label) => ({ label })) } } : {}),
            },
            include: {
                assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
                labels: true,
                createdBy: { select: { id: true, name: true } },
            },
        });

        return task;
    }

    async list(userId: string, query: ListTasksQuery) {
        const where: Prisma.TaskWhereInput = {
            ...(query.status && { status: query.status }),
        };

        const [tasks, total] = await prisma.$transaction([
            prisma.task.findMany({
                where,
                include: {
                    assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
                    labels: true,
                    createdBy: { select: { id: true, name: true } },
                },
                skip: (query.page - 1) * query.limit,
                take: query.limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.task.count({ where }),
        ]);

        return { tasks, meta: { total, page: query.page, limit: query.limit, totalPages: Math.ceil(total / query.limit) } };
    }

    async getById(taskId: string) {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
                labels: true,
                createdBy: { select: { id: true, name: true } },
            },
        });
        if (!task) throw new AppError(Errors.TASK_NOT_FOUND, 404);
        return task;
    }

    async update(userId: string, taskId: string, payload: UpdateTaskPayload) {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) throw new AppError(Errors.TASK_NOT_FOUND, 404);
        if (task.createdById !== userId) throw new AppError(Errors.ONLY_TASK_CREATOR_UPDATE, 403);

        const { assigneeIds, labels, recurrenceRule, ...data } = payload;

        const nextRecurrenceAt = recurrenceRule !== undefined
            ? recurrenceRule
                ? this.computeNextRecurrence(recurrenceRule, data.dueDate ? new Date(data.dueDate) : task.dueDate ?? new Date())
                : null
            : undefined;

        const updated = await prisma.$transaction(async (tx) => {
            if (assigneeIds !== undefined) {
                await tx.taskAssignee.deleteMany({ where: { taskId } });
                if (assigneeIds.length) {
                    await tx.taskAssignee.createMany({
                        data: assigneeIds.map((uid) => ({ taskId, userId: uid })),
                    });
                }
            }

            if (labels !== undefined) {
                await tx.taskLabel.deleteMany({ where: { taskId } });
                if (labels.length) {
                    await tx.taskLabel.createMany({
                        data: labels.map((label) => ({ taskId, label })),
                    });
                }
            }

            return tx.task.update({
                where: { id: taskId },
                data: {
                    ...(data.title !== undefined && { title: data.title }),
                    ...(data.description !== undefined && { description: data.description }),
                    ...(data.priority !== undefined && { priority: data.priority }),
                    ...(data.status !== undefined && { status: data.status }),
                    ...(data.storyPoints !== undefined && { storyPoints: data.storyPoints }),
                    ...(data.channelId !== undefined && { channelId: data.channelId }),
                    ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
                    ...(data.reminderAt !== undefined && { reminderAt: data.reminderAt ? new Date(data.reminderAt) : null }),
                    ...(recurrenceRule !== undefined && { recurrenceRule: recurrenceRule ?? null }),
                    ...(nextRecurrenceAt !== undefined && { nextRecurrenceAt }),
                },
                include: {
                    assignees: { include: { user: { select: { id: true, name: true, image: true } } } },
                    labels: true,
                    createdBy: { select: { id: true, name: true } },
                },
            });
        });

        return updated;
    }

    private computeNextRecurrence(rule: string, from: Date): Date {
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

    async delete(userId: string, taskId: string) {
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) throw new AppError(Errors.TASK_NOT_FOUND, 404);
        if (task.createdById !== userId) throw new AppError(Errors.ONLY_TASK_CREATOR_DELETE, 403);

        await prisma.task.delete({ where: { id: taskId } });
    }
}

export const service = new Service();

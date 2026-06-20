import { z } from "zod";

export const recurrenceRuleSchema = z.enum(["daily", "weekdays", "weekly", "biweekly", "monthly"]).optional();

export const createTaskSchema = z.object({
    title: z.string().min(1).max(200),
    description: z.string().max(5000).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    status: z.enum(["backlog", "in-progress", "in-review", "done"]).default("backlog"),
    storyPoints: z.number().int().positive().optional(),
    dueDate: z.string().datetime().optional(),
    reminderAt: z.string().datetime().optional(),
    recurrenceRule: recurrenceRuleSchema,
    channelId: z.string().optional(),
    assigneeIds: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
});

export const updateTaskSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(5000).optional().nullable(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    status: z.enum(["backlog", "in-progress", "in-review", "done"]).optional(),
    storyPoints: z.number().int().positive().optional().nullable(),
    dueDate: z.string().datetime().optional().nullable(),
    reminderAt: z.string().datetime().optional().nullable(),
    recurrenceRule: recurrenceRuleSchema,
    channelId: z.string().optional().nullable(),
    assigneeIds: z.array(z.string()).optional(),
    labels: z.array(z.string()).optional(),
});

export const taskIdSchema = z.object({
    id: z.string().min(1),
});

export const listTasksSchema = z.object({
    status: z.enum(["backlog", "in-progress", "in-review", "done"]).optional(),
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().max(100).optional().default(50),
});

export type CreateTaskPayload = z.infer<typeof createTaskSchema>;
export type UpdateTaskPayload = z.infer<typeof updateTaskSchema>;
export type ListTasksQuery = z.infer<typeof listTasksSchema>;

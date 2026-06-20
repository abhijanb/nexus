import { z } from "zod";

export const createConversationSchema = z.object({
    participantId: z.string().min(1),
});

export const listMessagesSchema = z.object({
    cursor: z.string().optional(),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const conversationIdSchema = z.object({
    id: z.string().min(1),
});

export const updateDMMessageSchema = z.object({
    content: z.string().min(1).max(10000),
});

export const dmMessageIdSchema = z.object({
    id: z.string().min(1),
    messageId: z.string().min(1),
});

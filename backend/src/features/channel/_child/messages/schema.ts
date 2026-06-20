import { z } from "zod";

export const listMessagesSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const updateMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});

export const messageIdSchema = z.object({
  id: z.string().min(1),
  messageId: z.string().min(1),
});

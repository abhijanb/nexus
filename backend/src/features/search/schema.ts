import { z } from "zod";

export const searchQuerySchema = z.object({
    q: z.string().min(1).max(200),
    type: z.enum(["all", "messages", "channels", "users", "tasks", "files"]).optional().default("all"),
    limit: z.coerce.number().int().positive().max(50).optional().default(10),
    fromDate: z.string().optional(),
    toDate: z.string().optional(),
    sender: z.string().optional(),
    mimeType: z.string().optional(),
    channelId: z.string().optional(),
});

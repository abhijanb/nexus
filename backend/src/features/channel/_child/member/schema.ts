import { z } from "zod";

export const channelMemberQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export type ChannelMemberQuery = z.infer<typeof channelMemberQuerySchema>;

export const deleteMemberSchema = z.object({
  id: z.string(),
  userId: z.string(),
});

export type DeleteMemberParams = z.infer<typeof deleteMemberSchema>;

export const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["OWNER", "MODERATOR", "MEMBER"]).optional().default("MEMBER"),
});

export type AddMemberPayload = z.infer<typeof addMemberSchema>;

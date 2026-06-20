import { z } from "zod";

export const listChannelsSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  includeArchived: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
export type ListChannelsQuery = z.infer<typeof listChannelsSchema>;

export const createChannelSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Use hyphens and lowercase for spaces"),
  description: z.string().max(500).optional(),
  type: z.enum(["PUBLIC", "PRIVATE"]).default("PUBLIC"),
  isArchived: z.boolean().default(false),
});
export type CreateChannelPayload = z.infer<typeof createChannelSchema>;

export const updateChannelSchema = z.object({
  name: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, "Use hyphens and lowercase for spaces").optional(),
  description: z.string().max(500).optional(),
  type: z.enum(["PUBLIC", "PRIVATE"]).optional(),
  isArchived: z.boolean().optional(),
});
export type UpdateChannelPayload = z.infer<typeof updateChannelSchema>;

export const channelIdSchema = z.object({
  id: z.string().min(1),
});

export const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["OWNER", "MODERATOR", "MEMBER"]).default("MEMBER"),
});

export const removeMemberSchema = z.object({
  channelId: z.string().min(1),
  userId: z.string().min(1),
});

export const postMessageSchema = z.object({
  content: z.string().min(1).max(10000),
});

export const inviteToChannelSchema = z.object({
  userId: z.string().min(1),
});

export const updateInviteSchema = z.object({
  inviteId: z.string().min(1),
});

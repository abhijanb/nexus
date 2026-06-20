import { z } from "zod";

export const searchUserSchema = z.object({
  query: z.string().min(1).max(100),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});
export type SearchUserQuery = z.infer<typeof searchUserSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  image: z.string().url().optional().nullable(),
});
export type UpdateProfilePayload = z.infer<typeof updateProfileSchema>;

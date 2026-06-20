import { z } from "zod";

const createChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Channel name is required")
    .max(64, "Maximum 64 characters")
    .regex(/^[a-z0-9-]+$/, "Use hyphens and lowercase for spaces"),
  description: z.string().optional(),
  privacy: z.enum(["PUBLIC", "PRIVATE"]),
  isArchived: z.boolean(),
});

export type CreateChannelData = z.infer<typeof createChannelSchema>;
export default createChannelSchema;

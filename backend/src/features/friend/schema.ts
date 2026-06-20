import { z } from "zod";

export const addFriendSchema = z.object({
    friendId: z.string().min(1),
});

export const friendIdSchema = z.object({
    id: z.string().min(1),
});

export const requestIdSchema = z.object({
    id: z.string().min(1),
});

export type AddFriendPayload = z.infer<typeof addFriendSchema>;

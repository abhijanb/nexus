import type { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validateOrThrow } from "../../utils/validate";
import { searchUserSchema, updateProfileSchema } from "./schema";
import { service } from "./service";
import { paginatedResponse, successResponse } from "../../utils/response";

export const searchUser: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const { query, limit, page } = validateOrThrow(searchUserSchema, req.query);
    const result = await service.searchUsers(req.user!.id, query, page, limit);
    paginatedResponse(res, result.users, result.meta);
});

export const updateProfile: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const payload = validateOrThrow(updateProfileSchema, req.body);
    const user = await service.updateProfile(req.user!.id, payload);
    successResponse(res, user, "Profile updated successfully");
});
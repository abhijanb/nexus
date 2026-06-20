import type { RequestHandler } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validateOrThrow } from "../../utils/validate";
import { service } from "./service";
import { addFriendSchema, friendIdSchema, requestIdSchema } from "./schema";
import { createdResponse, noContentResponse, successResponse } from "../../utils/response";

export const sendRequest: RequestHandler = asyncHandler(async (req, res) => {
    const payload = validateOrThrow(addFriendSchema, req.body);
    await service.sendRequest(req.user!.id, payload.friendId);
    createdResponse(res, null, "Friend request sent");
});

export const acceptRequest: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(requestIdSchema, req.params);
    await service.acceptRequest(req.user!.id, params.id);
    successResponse(res, null, "Friend request accepted");
});

export const rejectRequest: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(requestIdSchema, req.params);
    await service.rejectRequest(req.user!.id, params.id);
    successResponse(res, null, "Friend request rejected");
});

export const listFriends: RequestHandler = asyncHandler(async (req, res) => {
    const friends = await service.listFriends(req.user!.id);
    successResponse(res, friends, "Friends retrieved successfully");
});

export const listPendingRequests: RequestHandler = asyncHandler(async (req, res) => {
    const requests = await service.listPendingRequests(req.user!.id);
    successResponse(res, requests, "Pending requests retrieved successfully");
});

export const removeFriend: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(friendIdSchema, req.params);
    await service.removeFriend(req.user!.id, params.id);
    noContentResponse(res);
});

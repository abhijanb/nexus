import type { RequestHandler } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validateOrThrow } from "../../utils/validate";
import { channelIdSchema, createChannelSchema, inviteToChannelSchema, listChannelsSchema, updateChannelSchema } from "./schema";
import { service } from "./service";
import { createdResponse, paginatedResponse, successResponse } from "../../utils/response";
import { getIO } from "../../lib/socket";

export const createChannel: RequestHandler = asyncHandler(async (req, res) => {
    const payload = validateOrThrow(createChannelSchema, req.body);
    const channel = await service.createChannel(req.user!.id, payload);
    createdResponse(res, channel, "Channel created successfully");
});

export const listChannels: RequestHandler = asyncHandler(async (req, res) => {
    const query = validateOrThrow(listChannelsSchema, req.query);
    const channels = await service.getChannels(req.user!.id, query);
    paginatedResponse(res, channels.channels, channels.meta, "Channels retrieved successfully");
})

export const getChannel: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(channelIdSchema, req.params);
    const channel = await service.getChannelByName(req.user!.id, params.id);
    successResponse(res, channel, "Channel retrieved successfully");
});

export const updateChannel: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(channelIdSchema, req.params);
    const payload = validateOrThrow(updateChannelSchema, req.body);
    const channel = await service.updateChannel(req.user!.id, params.id, payload);
    successResponse(res, channel, "Channel updated successfully");
});

export const deleteChannel: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(channelIdSchema, req.params);
    await service.deleteChannel(req.user!.id, params.id);
    successResponse(res, null, "Channel deleted successfully");
});

export const inviteToChannel: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(channelIdSchema, req.params);
    const payload = validateOrThrow(inviteToChannelSchema, req.body);
    const result = await service.inviteToChannel(req.user!.id, params.id, payload);
    successResponse(res, result, "User invited to channel successfully");
});

export const pendingChannelInvites: RequestHandler = asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const query = validateOrThrow(listChannelsSchema, req.query);
    const result = await service.getPendingInvites(userId, query.page, query.limit);
    paginatedResponse(res, result.invites, result.meta, "Pending channel invites retrieved successfully");
});

export const acceptChannelInvite: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(channelIdSchema, req.params);
    const result = await service.acceptChannelInvite(req.user!.id, params.id);
    const io = getIO();
    io.to(result.channel!.id).emit("member:joined", {
        userId: result.user.id,
        name: result.user.name,
        image: result.user.image,
    });
    successResponse(res, result.channel, "Channel invite accepted successfully");
});

export const rejectChannelInvite: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(channelIdSchema, req.params);
    const result = await service.rejectChannelInvite(req.user!.id, params.id);
    successResponse(res, result, "Channel invite rejected successfully");
});
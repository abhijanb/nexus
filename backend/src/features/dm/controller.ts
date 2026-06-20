import type { RequestHandler } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validateOrThrow } from "../../utils/validate";
import { service } from "./service";
import { conversationIdSchema, createConversationSchema, dmMessageIdSchema, listMessagesSchema, updateDMMessageSchema } from "./schema";
import { createdResponse, cursorResponse, noContentResponse, successResponse } from "../../utils/response";
import { getIO } from "../../lib/socket";

export const listConversations: RequestHandler = asyncHandler(async (req, res) => {
    const conversations = await service.listConversations(req.user!.id);
    successResponse(res, conversations, "Conversations retrieved successfully");
});

export const createConversation: RequestHandler = asyncHandler(async (req, res) => {
    const payload = validateOrThrow(createConversationSchema, req.body);
    const conversation = await service.createConversation(req.user!.id, payload.participantId);
    createdResponse(res, conversation, "Conversation created successfully");
});

export const getConversation: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(conversationIdSchema, req.params);
    const conversation = await service.getConversation(req.user!.id, params.id);
    successResponse(res, conversation, "Conversation retrieved successfully");
});

export const listMessages: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(conversationIdSchema, req.params);
    const query = validateOrThrow(listMessagesSchema, req.query);
    const result = await service.listMessages(req.user!.id, params.id, query.cursor, query.limit);
    cursorResponse(res, result.messages, result.meta, "Messages retrieved successfully");
});

export const markConversationRead: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(conversationIdSchema, req.params);
    await service.markRead(req.user!.id, params.id);
    successResponse(res, null, "Conversation marked as read");
});

export const updateDirectMessage: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(dmMessageIdSchema, req.params);
    const payload = validateOrThrow(updateDMMessageSchema, req.body);
    const message = await service.updateDirectMessage(req.user!.id, params.id, params.messageId, payload.content);
    successResponse(res, message, "DM message updated");
});

export const deleteConversation: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(conversationIdSchema, req.params);
    const participants = await service.getConversationParticipants(params.id);
    await service.deleteConversation(req.user!.id, params.id);

    const io = getIO();
    for (const p of participants) {
        io.to(`user:${p.userId}`).emit("conversation:deleted", { conversationId: params.id });
    }

    noContentResponse(res);
});

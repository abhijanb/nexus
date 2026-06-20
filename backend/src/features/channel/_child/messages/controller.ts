import type { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../../../../middleware/asyncHandler";
import { validateOrThrow } from "../../../../utils/validate";
import { channelIdSchema } from "../../schema";
import { service } from "./service";
import { cursorResponse, successResponse } from "../../../../utils/response";
import { listMessagesSchema, messageIdSchema, updateMessageSchema } from "./schema";

export const listMessages: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const params = validateOrThrow(channelIdSchema, req.params);
    const query = validateOrThrow(listMessagesSchema, req.query);
    const result = await service.listMessages(req.user!.id, params.id, query.cursor, query.limit);
    cursorResponse(res, result.messages, result.meta, "messages");
});

export const updateMessage: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const params = validateOrThrow(messageIdSchema, req.params);
    const payload = validateOrThrow(updateMessageSchema, req.body);
    const message = await service.updateMessage(req.user!.id, params.id, params.messageId, payload.content);
    successResponse(res, message, "message updated");
});

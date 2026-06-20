import type { RequestHandler } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validateOrThrow } from "../../utils/validate";
import { service } from "./service";
import { searchQuerySchema } from "./schema";
import { successResponse } from "../../utils/response";

export const search: RequestHandler = asyncHandler(async (req, res) => {
    const query = validateOrThrow(searchQuerySchema, req.query);
    const results = await service.search(req.user!.id, query.q, query.type, query.limit, {
        fromDate: query.fromDate,
        toDate: query.toDate,
        sender: query.sender,
        mimeType: query.mimeType,
        channelId: query.channelId,
    });
    successResponse(res, results, "Search results");
});

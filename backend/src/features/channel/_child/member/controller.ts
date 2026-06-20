import type { Request, RequestHandler, Response } from "express";
import { asyncHandler } from "../../../../middleware/asyncHandler";
import { validateOrThrow } from "../../../../utils/validate";
import { channelIdSchema } from "../../schema";
import { addMemberSchema, channelMemberQuerySchema, deleteMemberSchema } from "./schema";
import { createdResponse, noContentResponse, paginatedResponse } from "../../../../utils/response";
import { service } from "./service";
import { getIO } from "../../../../lib/socket";

export const listMembers: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const params = validateOrThrow(channelIdSchema, req.params);
    const query = validateOrThrow(channelMemberQuerySchema, req.query);
    const result = await service.listChannelMembers(params.id, query);
    paginatedResponse(res, result.members, result.meta, "members");
});

export const addMember: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const params = validateOrThrow(channelIdSchema, req.params);
    const payload = validateOrThrow(addMemberSchema, req.body);
    const member = await service.addChannelMember(req.user!.id, params.id, payload);
    const io = getIO();
    io.to(params.id).emit("member:joined", {
        userId: member.user.id,
        name: member.user.name,
        image: member.user.image,
    });
    createdResponse(res, member, "Member added successfully");
});

export const deleteMember: RequestHandler = asyncHandler(async (req: Request, res: Response) => {
    const params = validateOrThrow(deleteMemberSchema, req.params);
    await service.deleteChannelMember(req.user!.id, params.id, params.userId);
    const io = getIO();
    io.to(params.id).emit("member:left", { userId: params.userId });
    noContentResponse(res);
});
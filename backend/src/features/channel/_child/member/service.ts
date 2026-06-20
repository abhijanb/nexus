import { prisma } from "../../../../lib/prisma";
import { AppError } from "../../../../utils/AppError";
import { Errors } from "../../../../utils/errorMessages";
import type { AddMemberPayload, ChannelMemberQuery } from "./schema";

class Service {
    async listChannelMembers(channelId: string, query: ChannelMemberQuery) {
        const { page, limit, search } = query;
        const offset = (page - 1) * limit;
        const [members, total] = await Promise.all([
            prisma.channelMember.findMany({
                where: {
                    channelId,
                    user: { ...(search ? { name: { contains: search, mode: "insensitive" } } : {}) }
                },
                skip: offset,
                take: limit,
                include: {
                    user: true,
                },
            }),
            prisma.channelMember.count({ where: { channelId } }),
        ]);
        const meta = { page, limit, total, totalPages: Math.ceil(total / limit) };
        return { members, meta };
    }

    async addChannelMember(requestingUserId: string, channelId: string, payload: AddMemberPayload) {
        const { userId, role } = payload;

        const requester = await prisma.channelMember.findFirst({
            where: { channelId, userId: requestingUserId },
        });
        if (!requester || requester.role === "MEMBER") {
            throw new AppError(Errors.ONLY_OWNER_MODERATOR, 403);
        }

        const existing = await prisma.channelMember.findUnique({
            where: { channelId_userId: { channelId, userId } },
            include: { user: { select: { id: true, name: true, image: true } } },
        });
        if (existing) throw new AppError(Errors.ALREADY_MEMBER, 409);

        const member = await prisma.channelMember.create({
            data: { channelId, userId, role },
            include: { user: { select: { id: true, name: true, image: true } } },
        });

        return member;
    }

    async deleteChannelMember(requestingUserId: string, channelId: string, targetUserId: string) {
        const requester = await prisma.channelMember.findFirst({
            where: { channelId, userId: requestingUserId },
        });
        if (!requester || requester.role === "MEMBER") {
            throw new AppError(Errors.ONLY_OWNER_MODERATOR_REMOVE, 403);
        }

        const target = await prisma.channelMember.findFirst({
            where: { channelId, userId: targetUserId },
        });
        if (!target) {
            throw new AppError(Errors.MEMBER_NOT_FOUND, 404);
        }

        if (target.role === "OWNER") {
            throw new AppError(Errors.CANNOT_REMOVE_OWNER, 403);
        }

        if (requester.role === "MODERATOR" && target.role === "MODERATOR") {
            throw new AppError(Errors.MODERATOR_CANNOT_REMOVE_MODERATOR, 403);
        }

        await prisma.channelMember.delete({
            where: {
                channelId_userId: {
                    channelId,
                    userId: targetUserId,
                },
            },
        });
    }
}

const svc = new Service();
export { svc as service };

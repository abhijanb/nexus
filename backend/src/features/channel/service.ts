import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { Errors } from "../../utils/errorMessages";
import { notify } from "../../lib/notify";
import type { Prisma } from "../../../generated/prisma/client";
import type { CreateChannelPayload, ListChannelsQuery, UpdateChannelPayload } from "./schema";

class Service {
    async createChannel(userId: string, payload: CreateChannelPayload) {
        const { name, description, type, isArchived } = payload;
        const [channel] = await prisma.$transaction(async (tx) => {
            const channel = await tx.channel.create({
                data: {
                    name,
                    ...(description && { description }),
                    type,
                    isArchived,
                    createdById: userId,
                }
            });
            await tx.channelMember.create({
                data: {
                    channelId: channel.id,
                    userId,
                    role: "OWNER",
                },
            });
            return [channel];
        });
        return channel;
    }

    async getChannels(userId: string, query: ListChannelsQuery) {
        const { search, type, includeArchived, page, limit } = query;
        const where: Prisma.ChannelWhereInput = {
            members: { some: { userId } },
            ...(type && { type }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: "insensitive" } },
                    { description: { contains: search, mode: "insensitive" } },
                ]
            }),
            ...(includeArchived === false && { isArchived: false }),
        };

        const [channels, total] = await prisma.$transaction([
            prisma.channel.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    _count: { select: { members: true } },
                },
            }),
            prisma.channel.count({ where }),
        ]);
        const meta = {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };

        return { channels, meta };
    }

    async getChannelByName(userId: string, name: string) {
        const channel = await prisma.channel.findFirst({
            where: {
                name,
                members: { some: { userId } },
            }
        });
        if (!channel) {
            throw new AppError(Errors.CHANNEL_NOT_FOUND, 404);
        }
        return channel;
    }

    async updateChannel(userId: string, channelId: string, payload: UpdateChannelPayload) {
        const channel = await prisma.channel.findFirst({
            where: {
                id: channelId,
                createdById: userId,
            }
        });
        if (!channel) {
            throw new AppError(Errors.CHANNEL_NOT_FOUND, 404);
        }
        const updatedChannel = await prisma.channel.update({
            where: { id: channelId },
            data: {
                ...(payload.name && { name: payload.name }),
                ...(payload.description && { description: payload.description }),
                ...(payload.type && { type: payload.type }),
                ...(payload.isArchived !== undefined && { isArchived: payload.isArchived }),
                ...(payload.isArchived === true && { archivedAt: new Date() }),
            },
        });
        return updatedChannel;
    }

    async deleteChannel(userId: string, channelId: string) {
        const channel = await prisma.channel.findFirst({
            where: {
                id: channelId,
                createdById: userId,
            }
        });
        if (!channel) {
            throw new AppError(Errors.CHANNEL_NOT_FOUND, 404);
        }
        await prisma.channel.delete({
            where: { id: channelId },
        });
    }

    async inviteToChannel(userId: string, channelId: string, payload: { userId: string }) {
        const channel = await prisma.channel.findFirst({
            where: {
                id: channelId,
                createdById: userId,
            }
        });
        if (!channel) {
            throw new AppError(Errors.CHANNEL_NOT_FOUND, 404);
        }

        const userToInvite = await prisma.user.findUnique({
            where: { id: payload.userId },
        });
        if (!userToInvite) {
            throw new AppError(Errors.USER_NOT_FOUND, 404);
        }

        const existingMembership = await prisma.channelMember.findFirst({
            where: {
                channelId,
                userId: payload.userId,
            }
        });
        if (existingMembership) {
            throw new AppError(Errors.ALREADY_MEMBER, 409);
        }

        const invite = await prisma.channelInvite.create({
            data: {
                channelId,
                invitedByUserId: userId,
                invitedUserId: payload.userId,
            },
            include: {
                channel: true,
                invitedBy: { select: { name: true } },
            },
        });

        await notify({
            userId: payload.userId,
            type: "CHANNEL_INVITE",
            title: `You've been invited to #${channel.name}`,
            body: `${invite.invitedBy.name} invited you to join ${channel.name}`,
            link: `/channels/invites/pending`,
            email: true,
        });

        return invite;
    }

    async getPendingInvites(userId: string, page: number = 1, limit: number = 10) {
        const [invites, totalCount] =
            await prisma.$transaction([
                prisma.channelInvite.findMany({
                    where: {
                        invitedUserId: userId,
                        status: "PENDING",
                    },
                    include: {
                        channel: true,
                        invitedBy: true,
                    },
                    skip: (page - 1) * limit,
                    take: limit,
                }),
                prisma.channelInvite.count({
                    where: {
                        invitedUserId: userId,
                        status: "PENDING",
                    },
                })
            ]);
        const meta = {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
        };
        return { invites, meta };
    }

    async acceptChannelInvite(userId: string, inviteId: string) {
        const invite = await prisma.channelInvite.findFirst({
            where: {
                id: inviteId,
                invitedUserId: userId,
                status: "PENDING",
            },
            include: {
                invitedBy: { select: { id: true, name: true, image: true } },
            },
        });
        if (!invite) {
            throw new AppError(Errors.CHANNEL_NOT_FOUND, 404);
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, image: true },
        });
        if (!user) {
            throw new AppError(Errors.USER_NOT_FOUND, 404);
        }
        await prisma.channelInvite.update({
            where: { id: invite.id },
            data: { status: "ACCEPTED" },
        });
        await prisma.channelMember.create({
            data: {
                channelId: invite.channelId,
                userId,
            }
        });
        const channel = await prisma.channel.findUnique({
            where: { id: invite.channelId },
        });
        return { channel, user };
    };

    async rejectChannelInvite(userId: string, inviteId: string) {
        const invite = await prisma.channelInvite.findFirst({
            where: {
                id: inviteId,
                invitedUserId: userId,
                status: "PENDING",
            }
        });
        if (!invite) {
            throw new AppError(Errors.CHANNEL_NOT_FOUND, 404);
        }
        await prisma.channelInvite.update({
            where: { id: invite.id },
            data: { status: "REJECTED" },
        });
        return { message: "Channel invite rejected successfully" };
    };
}

export const service = new Service();

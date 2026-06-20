import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { Errors } from "../../utils/errorMessages";
import { notify } from "../../lib/notify";

class Service {
    async sendRequest(userId: string, friendId: string) {
        if (userId === friendId) {
            throw new AppError(Errors.CANNOT_FRIEND_SELF, 400);
        }

        const [targetUser, currentUser] = await Promise.all([
            prisma.user.findUnique({ where: { id: friendId }, select: { id: true } }),
            prisma.user.findUnique({ where: { id: userId }, select: { name: true } }),
        ]);
        if (!targetUser) {
            throw new AppError(Errors.USER_NOT_FOUND, 404);
        }

        const existing = await prisma.friend.findFirst({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });

        if (existing) {
            if (existing.status === "ACCEPTED") throw new AppError(Errors.ALREADY_FRIENDS, 409);
            if (existing.status === "PENDING") throw new AppError(Errors.REQUEST_ALREADY_SENT, 409);
            throw new AppError(Errors.REQUEST_DECLINED, 409);
        }

        await prisma.friend.create({
            data: { userId, friendId, status: "PENDING" },
        });

        if (currentUser) {
            await notify({
                userId: friendId,
                type: "FRIEND_REQUEST",
                title: `${currentUser.name} sent you a friend request`,
                link: "/friends",
            });
        }
    }

    async acceptRequest(userId: string, requestId: string) {
        const request = await prisma.friend.findFirst({
            where: { id: requestId, friendId: userId, status: "PENDING" },
        });
        if (!request) throw new AppError(Errors.FRIEND_REQUEST_NOT_FOUND, 404);

        await prisma.friend.update({
            where: { id: requestId },
            data: { status: "ACCEPTED" },
        });

        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
        });

        if (currentUser) {
            await notify({
                userId: request.userId,
                type: "FRIEND_ACCEPTED",
                title: `${currentUser.name} accepted your friend request`,
                link: "/friends",
            });
        }
    }

    async rejectRequest(userId: string, requestId: string) {
        const request = await prisma.friend.findFirst({
            where: { id: requestId, friendId: userId, status: "PENDING" },
        });
        if (!request) throw new AppError(Errors.FRIEND_REQUEST_NOT_FOUND, 404);

        await prisma.friend.update({
            where: { id: requestId },
            data: { status: "DECLINED" },
        });
    }

    async listFriends(userId: string) {
        const friends = await prisma.friend.findMany({
            where: {
                OR: [
                    { userId, status: "ACCEPTED" },
                    { friendId: userId, status: "ACCEPTED" },
                ],
            },
            include: {
                user: { select: { id: true, name: true, image: true } },
                friend: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return friends.map((f) => (f.userId === userId ? f.friend : f.user));
    }

    async listPendingRequests(userId: string) {
        const requests = await prisma.friend.findMany({
            where: { friendId: userId, status: "PENDING" },
            include: {
                user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        return requests.map((r) => ({ id: r.id, user: r.user, createdAt: r.createdAt }));
    }

    async removeFriend(userId: string, friendId: string) {
        const existing = await prisma.friend.findFirst({
            where: {
                OR: [
                    { userId, friendId },
                    { userId: friendId, friendId: userId },
                ],
            },
        });

        if (!existing) {
            throw new AppError(Errors.FRIEND_NOT_FOUND, 404);
        }

        const otherUserId = existing.userId === userId ? existing.friendId : existing.userId;
        await prisma.friend.delete({ where: { id: existing.id } });

        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { name: true },
        });

        if (currentUser) {
            await notify({
                userId: otherUserId,
                type: "FRIEND_REMOVED",
                title: `${currentUser.name} removed you as a friend`,
                link: "/friends",
            });
        }
    }
}

export const service = new Service();

import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { Errors } from "../../utils/errorMessages";
import type { UpdateProfilePayload } from "./schema";

class Service {
    async searchUsers(userId: string, query: string, page: number, limit: number) {
        const friendRecords = await prisma.friend.findMany({
            where: {
                OR: [
                    { userId },
                    { friendId: userId },
                ],
            },
            select: { userId: true, friendId: true, status: true },
        });
        const pendingIds = new Set(
            friendRecords
                .filter((r) => r.status === "PENDING")
                .map((r) => (r.userId === userId ? r.friendId : r.userId))
        );

        const offset = (page - 1) * limit;
        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where: {
                    name: { contains: query, mode: "insensitive" },
                    id: { not: userId },
                },
                skip: offset,
                take: limit,
            }),
            prisma.user.count({
                where: {
                    name: { contains: query, mode: "insensitive" },
                    id: { not: userId },
                },
            })
        ]);
        const usersWithStatus = users.map((u) => ({
            ...u,
            hasPendingRequest: pendingIds.has(u.id),
        }));
        const meta = {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        }
        return { users: usersWithStatus, meta };
    }

    async updateProfile(userId: string, payload: UpdateProfilePayload) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new AppError(Errors.USER_NOT_FOUND, 404);

        return prisma.user.update({
            where: { id: userId },
            data: {
                ...(payload.name !== undefined && { name: payload.name }),
                ...(payload.image !== undefined && { image: payload.image }),
            },
        });
    }
}

const svc = new Service();
export { svc as service };

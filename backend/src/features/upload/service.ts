import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { Errors } from "../../utils/errorMessages";
import fs from "node:fs/promises";
import path from "node:path";

const ALLOWED_DIRS: Record<string, string> = {
    avatar: "uploads/avatar",
    message: "uploads/messages",
    post: "uploads/posts",
};

class Service {
    async create(userId: string, multerFile: Express.Multer.File) {
        const type = multerFile.destination.split("/").pop() ?? "message";

        const file = await prisma.file.create({
            data: {
                userId,
                originalName: multerFile.originalname,
                storedName: multerFile.filename,
                mimeType: multerFile.mimetype,
                size: multerFile.size,
                type,
            },
        });

        return file;
    }

    async list(userId: string, query: { type?: string | undefined; limit: number; offset: number }) {
        const where = {
            userId,
            ...(query.type && { type: query.type }),
        };

        const [files, total] = await prisma.$transaction([
            prisma.file.findMany({
                where,
                skip: query.offset,
                take: query.limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.file.count({ where }),
        ]);

        return { files, total };
    }

    async getById(userId: string, fileId: string) {
        const file = await prisma.file.findFirst({
            where: { id: fileId, userId },
        });
        if (!file) throw new AppError(Errors.FILE_NOT_FOUND, 404);
        return file;
    }

    async delete(userId: string, fileId: string) {
        const file = await prisma.file.findFirst({
            where: { id: fileId, userId },
        });
        if (!file) throw new AppError(Errors.FILE_NOT_FOUND, 404);

        const dir = ALLOWED_DIRS[file.type as keyof typeof ALLOWED_DIRS];
        if (dir) {
            const filePath = path.resolve(dir, file.storedName);
            const base = path.resolve(dir);
            if (filePath.startsWith(base)) {
                await fs.unlink(filePath).catch(() => {});
            }
        }

        await prisma.file.delete({ where: { id: fileId } });
    }
}

export const service = new Service();

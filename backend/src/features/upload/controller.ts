import fs from "node:fs/promises";
import path from "node:path";
import type { RequestHandler } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validateFileMagic } from "../../utils/fileType";
import { service } from "./service";
import { successResponse, createdResponse } from "../../utils/response";
import { validateOrThrow } from "../../utils/validate";
import { z } from "zod";
import { getUploadLimit } from "../../lib/multer";

const IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);
const FILE_MIMES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp", "application/pdf"]);

const listFilesSchema = z.object({
    type: z.string().optional(),
    limit: z.coerce.number().int().positive().max(100).optional().default(20),
    offset: z.coerce.number().int().min(0).optional().default(0),
});

const fileIdSchema = z.object({
    id: z.string().min(1),
});

function getUploadType(req: { query: { type?: string }; body?: { type?: string }; params?: { type?: string } }): string {
    return (req.query.type ?? req.body?.type ?? req.params?.type) as string;
}

function getSizeExceededMessage(size: number, limit: number, uploadType: string): string {
    return `File size ${(size / 1024 / 1024).toFixed(1)}MB exceeds ${limit / 1024 / 1024}MB limit for ${uploadType} uploads`;
}

export const imageUpload: RequestHandler = asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) {
        res.status(400).json({ message: "No file uploaded" });
        return;
    }

    const uploadType = getUploadType(req);
    const limit = getUploadLimit(uploadType);
    if (limit !== undefined && file.size > limit) {
        await fs.unlink(file.path).catch(() => {});
        res.status(413).json({ message: getSizeExceededMessage(file.size, limit, uploadType) });
        return;
    }

    const { valid, detected } = await validateFileMagic(file.path, IMAGE_MIMES);
    if (!valid) {
        await fs.unlink(file.path).catch(() => {});
        res.status(400).json({ message: `Invalid image type${detected ? `: ${detected}` : ""}` });
        return;
    }

    const record = await service.create(req.user!.id, file);
    createdResponse(res, record, "Image uploaded successfully");
});

export const fileUpload: RequestHandler = asyncHandler(async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
        res.status(400).json({ message: "No files uploaded" });
        return;
    }

    const uploadType = getUploadType(req);
    for (const file of files) {
        const limit = getUploadLimit(uploadType);
        if (limit !== undefined && file.size > limit) {
            await Promise.all(files.map(f => fs.unlink(f.path).catch(() => {})));
            res.status(413).json({
                message: `File size ${(file.size / 1024 / 1024).toFixed(1)}MB exceeds ${limit / 1024 / 1024}MB limit for ${uploadType} uploads`,
            });
            return;
        }

        const { valid, detected } = await validateFileMagic(file.path, FILE_MIMES);
        if (!valid) {
            await Promise.all(files.map(f => fs.unlink(f.path).catch(() => {})));
            res.status(400).json({ message: `Invalid file type in ${file.originalname}${detected ? `: ${detected}` : ""}` });
            return;
        }
    }

    const records = await Promise.all(
        files.map(file => service.create(req.user!.id, file))
    );

    createdResponse(res, records, "Files uploaded successfully");
});

const ALLOWED_DIRS: Record<string, string> = {
    avatar: "uploads/avatar",
    message: "uploads/messages",
    post: "uploads/posts",
};

export const downloadFile: RequestHandler = asyncHandler(async (req, res) => {
    const type = req.params.type as string;
    const filename = req.params.filename as string;
    const dir = ALLOWED_DIRS[type];

    if (!dir || !filename) {
        res.status(400).json({ message: "Invalid file type or filename" });
        return;
    }

    const safeName = path.basename(filename);
    if (!safeName) {
        res.status(400).json({ message: "Invalid filename" });
        return;
    }

    const filePath = path.resolve(dir, safeName);
    const base = path.resolve(dir);
    if (!filePath.startsWith(base)) {
        res.status(400).json({ message: "Invalid file path" });
        return;
    }

    try {
        await fs.access(filePath);
    } catch {
        res.status(404).json({ message: "File not found" });
        return;
    }

    if (req.query.dl !== undefined) {
        res.download(filePath, safeName);
    } else {
        res.sendFile(filePath);
    }
});

export const listFiles: RequestHandler = asyncHandler(async (req, res) => {
    const query = validateOrThrow(listFilesSchema, req.query);
    const result = await service.list(req.user!.id, query);
    successResponse(res, result, "Files retrieved successfully");
});

export const getFile: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(fileIdSchema, req.params);
    const file = await service.getById(req.user!.id, params.id);
    successResponse(res, file, "File retrieved successfully");
});

export const deleteFile: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(fileIdSchema, req.params);
    await service.delete(req.user!.id, params.id);
    successResponse(res, null, "File deleted successfully");
});

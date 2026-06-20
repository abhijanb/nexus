import multer from "multer";
import path from "path";
import fs from "fs";

export const UPLOAD_LIMITS = {
    avatar: 2 * 1024 * 1024,
    message: 5 * 1024 * 1024,
    post: 20 * 1024 * 1024,
} as const;

export const MAX_UPLOAD_SIZE = Math.max(...Object.values(UPLOAD_LIMITS));

export const MAX_FILE_COUNT = 10;

type UploadType = keyof typeof UPLOAD_LIMITS;

export function getUploadLimit(type: string): number | undefined {
    return UPLOAD_LIMITS[type as UploadType];
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = (req.query.type ?? req.body?.type ?? req.params?.type) as string;
        const allowedDirs: Record<string, string> = {
            avatar: "uploads/avatar",
            message: "uploads/messages",
            post: "uploads/posts",
        };

        const dir = allowedDirs[type];

        if (!dir) {
            return cb(new Error("Invalid upload type"), "");
        }

        fs.mkdirSync(dir, { recursive: true });

        cb(null, dir);
    },

    filename: (req, file, cb) => {
        const unique =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(null, unique + path.extname(file.originalname));
    },
});

export const upload = multer({
    storage,
    limits: {
        fileSize: MAX_UPLOAD_SIZE,
        files: MAX_FILE_COUNT,
    },
});
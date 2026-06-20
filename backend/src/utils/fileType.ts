import fs from "node:fs/promises";

type Signature = (number | null)[];

const MAGIC_BYTES: Record<string, Signature[]> = {
    "image/jpeg": [[0xff, 0xd8, 0xff]],
    "image/png": [[0x89, 0x50, 0x4e, 0x47]],
    "image/gif": [[0x47, 0x49, 0x46, 0x38]],
    "image/webp": [[0x52, 0x49, 0x46, 0x46, null, null, null, null, 0x57, 0x45, 0x42, 0x50]],
    "application/pdf": [[0x25, 0x50, 0x44, 0x46]],
};

const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

function bytesMatch(buffer: Buffer, signature: Signature, offset = 0): boolean {
    for (let i = 0; i < signature.length; i++) {
        if (signature[i] !== null && buffer[offset + i] !== signature[i]) {
            return false;
        }
    }
    return true;
}

function detectMime(buffer: Buffer): string | null {
    for (const [mime, signatures] of Object.entries(MAGIC_BYTES)) {
        for (const sig of signatures) {
            if (buffer.length >= sig.length && bytesMatch(buffer, sig)) {
                return mime;
            }
        }
    }
    return null;
}

export function isImageMime(mime: string): boolean {
    return IMAGE_TYPES.has(mime);
}

export async function validateFileMagic(filePath: string, allowedMimes: Set<string>): Promise<{ valid: boolean; detected: string | null }> {
    const fd = await fs.open(filePath, "r");
    try {
        const buffer = Buffer.alloc(12);
        await fd.read(buffer, 0, 12, 0);
        const detected = detectMime(buffer);
        return { valid: detected !== null && allowedMimes.has(detected), detected };
    } finally {
        await fd.close();
    }
}

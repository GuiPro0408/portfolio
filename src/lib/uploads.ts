import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

export type UploadResult = { url: string };

export interface UploadAdapter {
    upload(params: { file: File; filename?: string }): Promise<UploadResult>;
}

function getYearMonth(): { year: string; month: string } {
    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return { year, month };
}

class LocalUploadAdapter implements UploadAdapter {
    async upload({ file, filename }: { file: File; filename?: string }): Promise<UploadResult> {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const ext = path.extname(filename || file.name) || guessExtension(file.type) || "";
        const base = randomName();
        const { year, month } = getYearMonth();
        const relDir = path.posix.join("/uploads", year, month);
        const relPath = path.posix.join(relDir, `${base}${ext}`);
        const absDir = path.join(process.cwd(), "public", relDir);
        const absPath = path.join(process.cwd(), "public", relPath);
        await fs.mkdir(absDir, { recursive: true });
        await fs.writeFile(absPath, buffer);
        return { url: relPath.replace(/\\/g, "/") };
    }
}

class CloudinaryUploadAdapter implements UploadAdapter {
    async upload({ file }: { file: File }): Promise<UploadResult> {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;
        if (!cloudName || !apiKey || !apiSecret) {
            throw new Error("Missing Cloudinary credentials. Set CLOUDINARY_* env vars.");
        }
        const { year, month } = getYearMonth();
        const folder = `uploads/${year}/${month}`;
        const timestamp = Math.floor(Date.now() / 1000);
        const toSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
        const signature = crypto.createHash("sha1").update(toSign).digest("hex");

        const form = new FormData();
        form.set("file", file);
        form.set("folder", folder);
        form.set("timestamp", String(timestamp));
        form.set("api_key", apiKey);
        form.set("signature", signature);

        const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: "POST",
            body: form,
        });
        if (!resp.ok) {
            const txt = await resp.text().catch(() => "");
            throw new Error(`Cloudinary upload failed: ${resp.status} ${txt}`);
        }
        const json = await resp.json();
        const url: string = json.secure_url || json.url;
        return { url };
    }
}

export function getUploadAdapter(): UploadAdapter {
    const providerRaw = process.env.UPLOAD_PROVIDER ?? (process.env.NODE_ENV === "production" ? "cloudinary" : "local");
    const provider = String(providerRaw).toLowerCase();
    if (provider === "cloudinary") return new CloudinaryUploadAdapter();
    return new LocalUploadAdapter();
}

function randomName(): string {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function guessExtension(mime: string): string | undefined {
    if (mime === "image/jpeg") return ".jpg";
    if (mime === "image/png") return ".png";
    if (mime === "image/webp") return ".webp";
}



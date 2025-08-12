import { NextResponse } from "next/server";
import { getUploadAdapter } from "@/lib/uploads";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
        return NextResponse.json({ error: "No file" }, { status: 400 });
    }
    if (!ALLOWED.has(file.type)) {
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }
    if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    try {
        const adapter = getUploadAdapter();
        const { url } = await adapter.upload({ file });
        return NextResponse.json({ url });
    } catch {
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}



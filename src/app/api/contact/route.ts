import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const message = String(formData.get("message") || "").trim();

        if (!name || !email || !message) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }
        const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        if (!emailOk) {
            return NextResponse.json({ error: "Invalid email" }, { status: 400 });
        }

        // For now, just log on the server
        console.log("Contact submission:", { name, email, message });
        return NextResponse.json({ ok: true });
    } catch {
        return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
    }
}



"use client";

import * as React from "react";

export default function ContactPage() {
    const [status, setStatus] = React.useState<"idle" | "submitting" | "success" | "error">("idle");
    const formRef = React.useRef<HTMLFormElement>(null);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (status === "submitting") return;
        const form = e.currentTarget;
        const formData = new FormData(form);

        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim();
        const message = String(formData.get("message") || "").trim();

        if (!name || !email || !message) {
            alert("Please fill in all fields.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert("Please enter a valid email.");
            return;
        }

        setStatus("submitting");
        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                body: formData,
            });
            if (!res.ok) throw new Error("Request failed");
            setStatus("success");
            formRef.current?.reset();
        } catch {
            setStatus("error");
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Contact</h1>
            <form ref={formRef} onSubmit={onSubmit} className="space-y-3 max-w-xl">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex flex-col gap-1">
                        <label htmlFor="name" className="text-sm font-medium">Name</label>
                        <input id="name" name="name" className="rounded-md border border-slate-300 px-3 py-2 text-sm" required />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <input id="email" name="email" type="email" className="rounded-md border border-slate-300 px-3 py-2 text-sm" required />
                    </div>
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="message" className="text-sm font-medium">Message</label>
                    <textarea id="message" name="message" rows={6} className="rounded-md border border-slate-300 px-3 py-2 text-sm" required />
                </div>
                <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                    {status === "submitting" ? "Sending…" : "Send Message"}
                </button>
                {status === "success" ? (
                    <div className="text-sm text-green-700">Thanks! Your message has been sent.</div>
                ) : null}
                {status === "error" ? (
                    <div className="text-sm text-red-700">Something went wrong. Please try again.</div>
                ) : null}
            </form>
        </div>
    );
}



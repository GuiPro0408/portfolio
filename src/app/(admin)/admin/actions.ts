"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function parseBooleanFlag(value: FormDataEntryValue | null): boolean {
    if (typeof value !== "string") return false;
    return value === "on" || value === "true" || value === "1";
}

function parseStringArrayCSV(value: FormDataEntryValue | null): string[] {
    if (typeof value !== "string") return [];
    return value
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item.length > 0);
}

export async function createProject(formData: FormData): Promise<void> {
    const title = (formData.get("title") as string) ?? "";
    const slug = (formData.get("slug") as string) ?? "";
    const summary = (formData.get("summary") as string) ?? "";
    const content = (formData.get("content") as string) ?? "";
    const techStack = parseStringArrayCSV(formData.get("techStack"));
    const repoUrl = (formData.get("repoUrl") as string) || null;
    const demoUrl = (formData.get("demoUrl") as string) || null;
    const coverImage = (formData.get("coverImage") as string) || null;
    const featured = parseBooleanFlag(formData.get("featured"));

    await prisma.project.create({
        data: { title, slug, summary, content, techStack, repoUrl, demoUrl, coverImage, featured },
    });
    revalidatePath("/admin");
    redirect("/admin");
}

export async function updateProject(formData: FormData): Promise<void> {
    const id = Number(formData.get("id"));
    const title = (formData.get("title") as string) ?? "";
    const slug = (formData.get("slug") as string) ?? "";
    const summary = (formData.get("summary") as string) ?? "";
    const content = (formData.get("content") as string) ?? "";
    const techStack = parseStringArrayCSV(formData.get("techStack"));
    const repoUrl = (formData.get("repoUrl") as string) || null;
    const demoUrl = (formData.get("demoUrl") as string) || null;
    const coverImage = (formData.get("coverImage") as string) || null;
    const featured = parseBooleanFlag(formData.get("featured"));

    await prisma.project.update({
        where: { id },
        data: { title, slug, summary, content, techStack, repoUrl, demoUrl, coverImage, featured },
    });
    revalidatePath("/admin");
    redirect("/admin");
}

export async function deleteProject(formData: FormData): Promise<void> {
    const id = Number(formData.get("id"));
    await prisma.project.delete({ where: { id } });
    revalidatePath("/admin");
    redirect("/admin");
}

export async function createBlogPost(formData: FormData): Promise<void> {
    const title = (formData.get("title") as string) ?? "";
    const slug = (formData.get("slug") as string) ?? "";
    const excerpt = (formData.get("excerpt") as string) ?? "";
    const content = (formData.get("content") as string) ?? "";
    const coverImage = (formData.get("coverImage") as string) || null;
    const publishedAtRaw = (formData.get("publishedAt") as string) || new Date().toISOString();
    const publishedAt = new Date(publishedAtRaw);

    await prisma.blogPost.create({
        data: { title, slug, excerpt, content, coverImage, publishedAt },
    });
    revalidatePath("/admin");
    redirect("/admin");
}

export async function updateBlogPost(formData: FormData): Promise<void> {
    const id = Number(formData.get("id"));
    const title = (formData.get("title") as string) ?? "";
    const slug = (formData.get("slug") as string) ?? "";
    const excerpt = (formData.get("excerpt") as string) ?? "";
    const content = (formData.get("content") as string) ?? "";
    const coverImage = (formData.get("coverImage") as string) || null;
    const publishedAtRaw = (formData.get("publishedAt") as string) || new Date().toISOString();
    const publishedAt = new Date(publishedAtRaw);

    await prisma.blogPost.update({
        where: { id },
        data: { title, slug, excerpt, content, coverImage, publishedAt },
    });
    revalidatePath("/admin");
    redirect("/admin");
}

export async function deleteBlogPost(formData: FormData): Promise<void> {
    const id = Number(formData.get("id"));
    await prisma.blogPost.delete({ where: { id } });
    revalidatePath("/admin");
    redirect("/admin");
}



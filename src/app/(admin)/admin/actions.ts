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

async function handleCoverImageUpload(
    coverImage: string | null,
    coverFile: File | null
): Promise<string | null> {
    let finalCoverImage = coverImage;

    if (coverFile && coverFile.size > 0) {
        try {
            const uploadFormData = new FormData();
            uploadFormData.set("file", coverFile);
            const uploadResponse = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/upload`, {
                method: "POST",
                body: uploadFormData,
            });
            if (uploadResponse.ok) {
                const { url } = await uploadResponse.json();
                finalCoverImage = url;
            }
        } catch (error) {
            console.error("File upload failed:", error);
        }
    }

    return finalCoverImage;
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

    // Handle file upload if coverFile is present
    const coverFile = formData.get("coverFile") as File | null;
    const finalCoverImage = await handleCoverImageUpload(coverImage, coverFile);

    await prisma.project.create({
        data: { title, slug, summary, content, techStack, repoUrl, demoUrl, coverImage: finalCoverImage, featured },
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

    // Handle file upload if coverFile is present
    const coverFile = formData.get("coverFile") as File | null;
    const finalCoverImage = await handleCoverImageUpload(coverImage, coverFile);

    await prisma.project.update({
        where: { id },
        data: { title, slug, summary, content, techStack, repoUrl, demoUrl, coverImage: finalCoverImage, featured },
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

    // Handle file upload if coverFile is present
    const coverFile = formData.get("coverFile") as File | null;
    const finalCoverImage = await handleCoverImageUpload(coverImage, coverFile);

    await prisma.blogPost.create({
        data: { title, slug, excerpt, content, coverImage: finalCoverImage, publishedAt },
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

    // Handle file upload if coverFile is present
    const coverFile = formData.get("coverFile") as File | null;
    const finalCoverImage = await handleCoverImageUpload(coverImage, coverFile);

    await prisma.blogPost.update({
        where: { id },
        data: { title, slug, excerpt, content, coverImage: finalCoverImage, publishedAt },
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



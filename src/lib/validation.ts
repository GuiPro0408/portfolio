import { z } from "zod";

export const projectInputSchema = z.object({
    id: z.coerce.number().int().positive().optional(),
    title: z.string().min(2, "Title is required"),
    slug: z
        .string()
        .min(2, "Slug is required")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and dashes only"),
    summary: z.string().min(1, "Summary is required").max(500).optional().or(z.literal("")),
    content: z.string().min(1, "Content is required"),
    techStack: z.array(z.string()).default([]),
    repoUrl: z.string().url().optional().or(z.literal("")),
    demoUrl: z.string().url().optional().or(z.literal("")),
    coverImage: z.string().url().optional().or(z.literal("")),
    featured: z.boolean().optional().default(false),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;

export const blogPostInputSchema = z.object({
    id: z.coerce.number().int().positive().optional(),
    title: z.string().min(2, "Title is required"),
    slug: z
        .string()
        .min(2, "Slug is required")
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers, and dashes only"),
    excerpt: z.string().min(1, "Excerpt is required").max(500),
    content: z.string().min(1, "Content is required"),
    coverImage: z.string().url().optional().or(z.literal("")),
    publishedAt: z.coerce.date(),
});

export type BlogPostInput = z.infer<typeof blogPostInputSchema>;



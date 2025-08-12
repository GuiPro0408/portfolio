import "server-only";

import { prisma } from "@/lib/db";
import type { BlogPost, Project } from "@prisma/client";

export async function getFeaturedProjects(limit = 3): Promise<Project[]> {
  return prisma.project.findMany({
    where: { featured: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getLatestBlogPosts(limit = 3): Promise<BlogPost[]> {
  return prisma.blogPost.findMany({
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function getAllProjects(): Promise<Project[]> {
  return prisma.project.findMany({ orderBy: { createdAt: "desc" } });
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return prisma.project.findUnique({ where: { slug } });
}

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  return prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return prisma.blogPost.findUnique({ where: { slug } });
}



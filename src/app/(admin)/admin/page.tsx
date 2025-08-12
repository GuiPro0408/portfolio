import { prisma } from "@/lib/db";
import AdminPanel from "./AdminPanel";

export default async function AdminDashboardPage() {
  const [projects, posts] = await Promise.all([
    prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin</h1>
      <AdminPanel projects={projects} posts={posts} />
    </div>
  );
}



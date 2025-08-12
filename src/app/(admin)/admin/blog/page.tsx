import { prisma } from "@/lib/db";

export default async function AdminBlogPage() {
  const posts = await prisma.blogPost.findMany({ orderBy: { publishedAt: "desc" } });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Blog Posts</h1>
        <a href="/admin/blog/new" className="rounded-md bg-black text-white px-3 py-1.5 text-sm">New Post</a>
      </div>
      <ul className="divide-y rounded-md border">
        {posts.map((p) => (
          <li key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-slate-600">/{p.slug}</div>
            </div>
            <a href={`/admin/blog/${p.id}`} className="text-sm text-blue-600">Edit</a>
          </li>
        ))}
      </ul>
    </div>
  );
}



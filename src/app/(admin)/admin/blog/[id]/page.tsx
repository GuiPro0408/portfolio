import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

interface Props { params: Promise<{ id: string }> }

export default async function EditBlogPostPage({ params }: Props) {
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id: Number(id) } });
  if (!post) return notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Blog Post</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input defaultValue={post.title} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input defaultValue={post.slug} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Excerpt</label>
          <textarea defaultValue={post.excerpt} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div className="flex gap-2">
          <button disabled className="rounded-md bg-black text-white px-3 py-1.5 text-sm opacity-60">Save (stub)</button>
          <a href="/admin/blog" className="rounded-md border px-3 py-1.5 text-sm">Back</a>
        </div>
      </form>
    </div>
  );
}



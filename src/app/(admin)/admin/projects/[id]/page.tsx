import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

interface Props { params: Promise<{ id: string }> }

export default async function EditProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await prisma.project.findUnique({ where: { id: Number(id) } });
  if (!project) return notFound();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Project</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input defaultValue={project.title} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input defaultValue={project.slug} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Summary</label>
          <textarea defaultValue={project.summary} className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div className="flex gap-2">
          <button disabled className="rounded-md bg-black text-white px-3 py-1.5 text-sm opacity-60">Save (stub)</button>
          <a href="/admin/projects" className="rounded-md border px-3 py-1.5 text-sm">Back</a>
        </div>
      </form>
    </div>
  );
}



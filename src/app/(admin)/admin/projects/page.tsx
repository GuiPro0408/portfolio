import { prisma } from "@/lib/db";

export default async function AdminProjectsPage() {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <a href="/admin/projects/new" className="rounded-md bg-black text-white px-3 py-1.5 text-sm">New Project</a>
      </div>
      <ul className="divide-y rounded-md border">
        {projects.map((p) => (
          <li key={p.id} className="p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{p.title}</div>
              <div className="text-xs text-slate-600">/{p.slug}</div>
            </div>
            <a href={`/admin/projects/${p.id}`} className="text-sm text-blue-600">Edit</a>
          </li>
        ))}
      </ul>
    </div>
  );
}



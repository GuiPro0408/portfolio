export default async function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a href="/admin/projects" className="border rounded-lg p-4 hover:bg-slate-50">
          <h2 className="font-medium">Manage Projects →</h2>
          <p className="text-sm text-slate-600">Create, edit, and feature projects</p>
        </a>
        <a href="/admin/blog" className="border rounded-lg p-4 hover:bg-slate-50">
          <h2 className="font-medium">Manage Blog →</h2>
          <p className="text-sm text-slate-600">Publish and edit blog posts</p>
        </a>
      </div>
    </div>
  );
}



export default function NewBlogPostPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Blog Post</h1>
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input placeholder="Title" className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Slug</label>
          <input placeholder="slug" className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Excerpt</label>
          <textarea placeholder="Short excerpt" className="mt-1 w-full rounded-md border px-3 py-2" />
        </div>
        <button disabled className="rounded-md bg-black text-white px-3 py-1.5 text-sm opacity-60">Create (stub)</button>
      </form>
    </div>
  );
}



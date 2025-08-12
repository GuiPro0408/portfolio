"use client";

import * as React from "react";
import type { BlogPost, Project } from "@prisma/client";
import {
  createProject,
  updateProject,
  deleteProject,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "./actions";

type Props = {
  projects: Project[];
  posts: BlogPost[];
};

type Tab = "projects" | "blog";

function formatDateTimeLocal(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function AdminPanel({ projects, posts }: Props) {
  const [tab, setTab] = React.useState<Tab>("projects");

  return (
    <div className="grid grid-cols-[220px_1fr] gap-6">
      <aside className="border rounded-md p-3 h-fit">
        <div className="text-sm font-semibold mb-2">Resources</div>
        <nav className="space-y-1">
          <button
            onClick={() => setTab("projects")}
            className={`w-full text-left px-2 py-1 rounded ${tab === "projects" ? "bg-black text-white" : "hover:bg-slate-100"
              }`}
          >
            Projects
          </button>
          <button
            onClick={() => setTab("blog")}
            className={`w-full text-left px-2 py-1 rounded ${tab === "blog" ? "bg-black text-white" : "hover:bg-slate-100"
              }`}
          >
            Blog Posts
          </button>
        </nav>
      </aside>

      <section className="space-y-8">
        {tab === "projects" ? (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">Create Project</h2>
              <form action={createProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Title</label>
                  <input name="title" required className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Slug</label>
                  <input name="slug" required className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Summary</label>
                  <textarea name="summary" required className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Content</label>
                  <textarea name="content" required rows={6} className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Tech Stack (comma-separated)</label>
                  <input name="techStack" placeholder="Next.js, Tailwind, Prisma" className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Repo URL</label>
                  <input name="repoUrl" className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Demo URL</label>
                  <input name="demoUrl" className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Cover Image URL</label>
                  <input name="coverImage" className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div className="flex items-center gap-2">
                  <input id="featured" name="featured" type="checkbox" className="rounded border" />
                  <label htmlFor="featured" className="text-sm">Featured</label>
                </div>
                <div className="md:col-span-2">
                  <button className="rounded-md bg-black text-white px-3 py-1.5 text-sm">Create</button>
                </div>
              </form>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">All Projects</h2>
              <div className="divide-y rounded-md border">
                {projects.map((p) => (
                  <details key={p.id} className="p-4">
                    <summary className="cursor-pointer font-medium">{p.title} <span className="text-xs text-slate-600">/{p.slug}</span></summary>
                    <div className="mt-4 space-y-4">
                      <form action={updateProject} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="hidden" name="id" value={p.id} />
                        <div>
                          <label className="block text-sm font-medium">Title</label>
                          <input name="title" defaultValue={p.title} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">Slug</label>
                          <input name="slug" defaultValue={p.slug} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium">Summary</label>
                          <textarea name="summary" defaultValue={p.summary ?? ""} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium">Content</label>
                          <textarea name="content" defaultValue={p.content ?? ""} rows={6} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">Tech Stack (comma-separated)</label>
                          <input name="techStack" defaultValue={(p.techStack ?? []).join(", ")} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">Repo URL</label>
                          <input name="repoUrl" defaultValue={p.repoUrl ?? ""} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">Demo URL</label>
                          <input name="demoUrl" defaultValue={p.demoUrl ?? ""} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">Cover Image URL</label>
                          <input name="coverImage" defaultValue={p.coverImage ?? ""} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div className="flex items-center gap-2">
                          <input id={`featured-${p.id}`} name="featured" type="checkbox" defaultChecked={p.featured} className="rounded border" />
                          <label htmlFor={`featured-${p.id}`} className="text-sm">Featured</label>
                        </div>
                        <div className="md:col-span-2 flex gap-2">
                          <button className="rounded-md bg-black text-white px-3 py-1.5 text-sm">Save</button>
                        </div>
                      </form>
                      <form action={deleteProject} className="mt-2">
                        <input type="hidden" name="id" value={p.id} />
                        <button className="rounded-md border px-3 py-1.5 text-sm text-red-600">Delete</button>
                      </form>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-semibold mb-3">Create Blog Post</h2>
              <form action={createBlogPost} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Title</label>
                  <input name="title" required className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Slug</label>
                  <input name="slug" required className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Excerpt</label>
                  <textarea name="excerpt" required className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium">Content</label>
                  <textarea name="content" required rows={6} className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Cover Image URL</label>
                  <input name="coverImage" className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium">Published At</label>
                  <input name="publishedAt" type="datetime-local" defaultValue={formatDateTimeLocal(new Date())} className="mt-1 w-full rounded-md border px-3 py-2" />
                </div>
                <div className="md:col-span-2">
                  <button className="rounded-md bg-black text-white px-3 py-1.5 text-sm">Create</button>
                </div>
              </form>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-3">All Posts</h2>
              <div className="divide-y rounded-md border">
                {posts.map((post) => (
                  <details key={post.id} className="p-4">
                    <summary className="cursor-pointer font-medium">{post.title} <span className="text-xs text-slate-600">/{post.slug}</span></summary>
                    <div className="mt-4 space-y-4">
                      <form action={updateBlogPost} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="hidden" name="id" value={post.id} />
                        <div>
                          <label className="block text-sm font-medium">Title</label>
                          <input name="title" defaultValue={post.title} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">Slug</label>
                          <input name="slug" defaultValue={post.slug} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium">Excerpt</label>
                          <textarea name="excerpt" defaultValue={post.excerpt ?? ""} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium">Content</label>
                          <textarea name="content" defaultValue={post.content ?? ""} rows={6} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">Cover Image URL</label>
                          <input name="coverImage" defaultValue={post.coverImage ?? ""} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium">Published At</label>
                          <input name="publishedAt" type="datetime-local" defaultValue={formatDateTimeLocal(post.publishedAt)} className="mt-1 w-full rounded-md border px-3 py-2" />
                        </div>
                        <div className="md:col-span-2 flex gap-2">
                          <button className="rounded-md bg-black text-white px-3 py-1.5 text-sm">Save</button>
                        </div>
                      </form>
                      <form action={deleteBlogPost} className="mt-2">
                        <input type="hidden" name="id" value={post.id} />
                        <button className="rounded-md border px-3 py-1.5 text-sm text-red-600">Delete</button>
                      </form>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}



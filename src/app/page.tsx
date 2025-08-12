import Link from "next/link";
import Image from "next/image";
import { getFeaturedProjects, getLatestBlogPosts } from "@/lib/queries";

export default async function Home() {
  const [projects, posts] = await Promise.all([
    getFeaturedProjects(3),
    getLatestBlogPosts(3),
  ]);

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">Guillaume Juste</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Full‑stack developer. I build performant, accessible web apps with Next.js, Prisma, and MUI.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/projects" className="inline-flex items-center rounded-md bg-slate-900 text-white px-4 py-2 text-sm font-medium">
            View Projects
          </Link>
          <Link href="/blog" className="inline-flex items-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium">
            Read Blog
          </Link>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Featured Projects</h2>
          <Link href="/projects" className="text-sm text-slate-600 hover:underline">Browse all</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/projects/${p.slug}`} className="group rounded-lg border border-slate-200 hover:border-slate-300 transition overflow-hidden">
              {p.coverImage ? (
                <div className="relative aspect-video">
                  <Image src={p.coverImage} alt={p.title} fill className="object-cover" />
                </div>
              ) : null}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold group-hover:underline">{p.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{p.summary}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {(p.techStack ?? []).slice(0, 4).map((t) => (
                    <span key={t} className="text-xs bg-slate-100 rounded px-2 py-0.5">{t}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
          {projects.length === 0 ? (
            <div className="text-slate-600">No featured projects yet.</div>
          ) : null}
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Latest Articles</h2>
          <Link href="/blog" className="text-sm text-slate-600 hover:underline">Browse all</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group rounded-lg border border-slate-200 hover:border-slate-300 transition overflow-hidden">
              {post.coverImage ? (
                <div className="relative aspect-video">
                  <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                </div>
              ) : null}
              <div className="p-4 space-y-2">
                <h3 className="font-semibold group-hover:underline">{post.title}</h3>
                <p className="text-sm text-slate-600 line-clamp-2">{post.excerpt}</p>
                <div className="text-xs text-slate-500">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
          {posts.length === 0 ? (
            <div className="text-slate-600">No posts yet.</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { getAllBlogPosts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
    const posts = await getAllBlogPosts();
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Blog</h1>
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
                            <div className="text-xs text-slate-500">{new Date(post.publishedAt).toLocaleDateString()}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}



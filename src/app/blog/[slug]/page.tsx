import Image from "next/image";
import { notFound } from "next/navigation";
import { getBlogPostBySlug } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export default async function BlogArticlePage({ params }: Props) {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);
    if (!post) return notFound();

    return (
        <article className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold">{post.title}</h1>
                <div className="text-sm text-slate-500">{new Date(post.publishedAt).toLocaleDateString()}</div>
            </header>
            {post.coverImage ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
                </div>
            ) : null}
            <div className="prose max-w-none">
                {post.content}
            </div>
        </article>
    );
}



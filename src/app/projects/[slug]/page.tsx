import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getProjectBySlug } from "@/lib/queries";

type Props = { params: Promise<{ slug: string }> };

export default async function ProjectDetailPage({ params }: Props) {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);
    if (!project) return notFound();

    return (
        <article className="space-y-6">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold">{project.title}</h1>
                <div className="flex flex-wrap gap-2">
                    {(project.techStack ?? []).map((t) => (
                        <span key={t} className="text-xs bg-slate-100 rounded px-2 py-0.5">{t}</span>
                    ))}
                </div>
                <div className="flex gap-3 text-sm">
                    {project.repoUrl ? (
                        <Link href={project.repoUrl} className="underline" target="_blank" rel="noreferrer">Repository</Link>
                    ) : null}
                    {project.demoUrl ? (
                        <Link href={project.demoUrl} className="underline" target="_blank" rel="noreferrer">Live Demo</Link>
                    ) : null}
                </div>
            </header>

            {project.coverImage ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border">
                    <Image src={project.coverImage} alt={project.title} fill className="object-cover" />
                </div>
            ) : null}

            <div className="prose max-w-none">
                {project.content}
            </div>
        </article>
    );
}



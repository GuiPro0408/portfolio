"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@prisma/client";

type Props = { initialProjects: Project[] };

export default function ProjectsFilters({ initialProjects }: Props) {
    const [query, setQuery] = React.useState("");
    const [activeTech, setActiveTech] = React.useState<string | null>(null);

    const techs = React.useMemo(() => {
        const set = new Set<string>();
        initialProjects.forEach((p) => (p.techStack ?? []).forEach((t) => set.add(t)));
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [initialProjects]);

    const filtered = React.useMemo(() => {
        const q = query.trim().toLowerCase();
        return initialProjects.filter((p) => {
            const matchesQuery = !q || `${p.title} ${p.slug} ${p.summary ?? ""} ${(p.techStack ?? []).join(" ")}`.toLowerCase().includes(q);
            const matchesTech = !activeTech || (p.techStack ?? []).includes(activeTech);
            return matchesQuery && matchesTech;
        });
    }, [initialProjects, query, activeTech]);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
                <input
                    className="w-full sm:w-80 rounded-md border border-slate-300 px-3 py-2 text-sm"
                    placeholder="Search projects…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search projects"
                />
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setActiveTech(null)}
                        className={`text-xs px-2 py-1 rounded border ${activeTech === null ? "bg-slate-900 text-white border-slate-900" : "border-slate-300"}`}
                    >
                        All
                    </button>
                    {techs.map((t) => (
                        <button
                            key={t}
                            onClick={() => setActiveTech((cur) => (cur === t ? null : t))}
                            className={`text-xs px-2 py-1 rounded border ${activeTech === t ? "bg-slate-900 text-white border-slate-900" : "border-slate-300"}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((p) => (
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
                                {(p.techStack ?? []).slice(0, 6).map((t) => (
                                    <span key={t} className="text-xs bg-slate-100 rounded px-2 py-0.5">{t}</span>
                                ))}
                            </div>
                        </div>
                    </Link>
                ))}
                {filtered.length === 0 ? (
                    <div className="text-slate-600">No projects match your filters.</div>
                ) : null}
            </div>
        </div>
    );
}



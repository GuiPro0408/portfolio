import { getAllProjects } from "@/lib/queries";
import ProjectsFilters from "./ui/ProjectsFilters";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
    const projects = await getAllProjects();
    return (
        <div className="space-y-6">
            <div className="flex items-end justify-between">
                <h1 className="text-3xl font-bold">Projects</h1>
            </div>
            <ProjectsFilters initialProjects={projects} />
        </div>
    );
}



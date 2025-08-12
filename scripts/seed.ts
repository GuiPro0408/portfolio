import "dotenv/config";
import { prisma } from "../lib/db";

async function main() {
  await prisma.project.createMany({
    data: [
      {
        title: "Portfolio Starter",
        slug: "portfolio-starter",
        summary: "Base scaffold for Guillaume’s portfolio.",
        content: "Initial project seed content.",
        techStack: ["Next.js", "Tailwind", "MUI", "Prisma", "PostgreSQL"],
        featured: true,
      },
      {
        title: "3D Globe Visualization",
        slug: "3d-globe-visualization",
        summary: "Interactive WebGL globe with country markers.",
        content: "A fun experiment rendering a globe in the browser using Three.js.",
        techStack: ["Next.js", "Three.js", "TypeScript"],
        repoUrl: "https://github.com/username/globe",
        demoUrl: "https://globe.example.com",
        featured: false,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.blogPost.createMany({
    data: [
      {
        title: "Hello World",
        slug: "hello-world",
        excerpt: "First post on the new portfolio.",
        content: "Welcome to my portfolio!",
        publishedAt: new Date(),
      },
      {
        title: "Why I Built This",
        slug: "why-i-built-this",
        excerpt: "A brief story behind this portfolio site.",
        content: "Sharing the motivation and stack choices for this project.",
        publishedAt: new Date(),
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



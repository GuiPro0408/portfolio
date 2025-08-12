# AI agent guide for this repo

Goal: get productive fast in this Next.js (App Router) portfolio using Prisma/Postgres, NextAuth, and a small admin CMS.

## Architecture
- App Router in `src/app` (Server Components by default). Use "use client" only when hooks/DOM APIs are needed.
- Data: Prisma singleton at `src/lib/db.ts`; schema in `prisma/schema.prisma`; queries in `src/lib/queries.ts`.
- Auth: NextAuth (JWT) with PrismaAdapter + Credentials. Config `src/lib/auth.ts`; route `src/app/api/auth/[...nextauth]/route.ts`. JWT/session include `role` and `user.id`.
- Access control: `src/middleware.ts` gates `/admin` to `role === "admin"`; otherwise redirects to sign-in.
- Admin UI: pages under `src/app/(admin)/admin/*` list/edit Projects and Blog posts using server actions and Prisma.
- Uploads: `src/lib/uploads.ts` provides `getUploadAdapter()` (local to `public/uploads/YYYY/MM/*` or Cloudinary). API `src/app/api/upload/route.ts` validates and returns `{ url }`.
- Contact: `src/app/api/contact/route.ts` accepts POST; currently logs.

## Workflows
- Dev: `npm run dev` (Turbopack). Lint: `npm run lint`. Build/start: `npm run build`; `npm start`.
- DB (Docker): `npm run db:up` | `db:down` | `db:logs`.
- Prisma: `npx prisma migrate dev --name <change>` (local); `npm run migrate:deploy` (prod/CI); `npx prisma studio`; `npx prisma generate`.
- Seed: `npm run seed`. Windows: `copy .env.example .env` to bootstrap env.

## Conventions
- TypeScript strict; import via `@/*` alias (see `tsconfig.json`). Never new PrismaClient per request—always `import { prisma } from "@/lib/db"`.
- Prefer server-side data fetching. Keep validation with Zod (`src/lib/validation.ts`) and reuse schemas in forms via RHF + zod resolver.
- Admin CRUD uses server actions + Prisma; file fields are URLs from `/api/upload`.
- Role strings are lowercase (e.g., "admin"); middleware depends on this.
- Images: `next.config.ts` allows Unsplash/Cloudinary remotes; local uploads are served from `/uploads/**` in `public`.

## Integration
- Env: `DATABASE_URL`, `NEXTAUTH_SECRET` (and `NEXTAUTH_URL` in prod). Uploads: `UPLOAD_PROVIDER=local|cloudinary`; Cloudinary needs `CLOUDINARY_CLOUD_NAME|API_KEY|API_SECRET`.
- Vercel: `vercel.json` runs `npm run migrate:deploy && next build`.

## Examples
- Queries: `getFeaturedProjects()` in `src/lib/queries.ts`.
- Route protection: see matcher and role check in `src/middleware.ts`.
- Upload: POST multipart `file` to `/api/upload` → `{ url }`; store URL on model.
- Admin pages: add under `src/app/(admin)/admin/...` and rely on middleware for gating.

## Gotchas
- Don’t create multiple Prisma clients; import the singleton.
- After schema changes: update Zod schemas and seed as needed; then migrate.
- Local upload URLs are relative (e.g., `/uploads/2025/08/abc.jpg`); render via `next/image` or raw `<img>`.

Start here for new features: update Prisma schema → `migrate dev` → add query helpers → implement route/server action → build UI.

Questions or gaps? Ask and we’ll refine this guide.

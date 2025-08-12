This is a Next.js portfolio with Prisma and PostgreSQL.

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Copy env and fill values:

```bash
cp .env.example .env
# On Windows PowerShell:
copy .env.example .env
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database via Docker Compose

Start Postgres and optional pgAdmin:

```bash
docker compose up -d
```

- Postgres: `localhost:5432` (user: `postgres`, password: `postgres`, db: `portfolio`)
- pgAdmin: http://localhost:5050 (admin@example.com / admin)

Update `.env` if needed:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/portfolio?schema=public"
```

Apply schema and seed:

```bash
npx prisma migrate dev --name init
npm run seed
```

## Deploying to Vercel

1. In Vercel Project Settings → Environment Variables, add:

   - `DATABASE_URL` → your managed Postgres URL
   - `NEXTAUTH_URL` → your production URL (e.g., `https://your-app.vercel.app`)
   - `NEXTAUTH_SECRET` → a strong secret

2. Build settings (already configured via `vercel.json`):

   - Build Command: `npm run migrate:deploy && next build`
   - Install Command: `npm ci`

3. Trigger a new deployment.

Notes:
- `prisma migrate deploy` applies migrations safely in production.
- Seeding is local-only via `npm run seed`.

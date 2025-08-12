## Overview

This repository is a Next.js (App Router) portfolio with Prisma ORM and PostgreSQL. It includes an admin area protected by auth and a ready-to-run Docker setup for local development (Postgres + pgAdmin with a pre-registered connection).

## Prerequisites

- Node.js 20+ and npm 10+
- Docker Desktop (for local Postgres/pgAdmin)

## Quick Start

1) Install dependencies

```bash
npm install
```

2) Create environment file

```bash
cp .env.example .env
# Windows PowerShell
copy .env.example .env
```

3) Start database (Postgres + pgAdmin)

```bash
npm run db:up
```

- Postgres: `localhost:5432` (user: `postgres`, password: `postgres`, db: `portfolio`)
- pgAdmin: [http://localhost:5050](http://localhost:5050) (email: `admin@example.com`, password: `admin`)
- A pgAdmin server connection to `postgres` is pre-registered.

4) Apply database schema and seed sample data

```bash
npx prisma migrate dev --name init
npm run seed
```

5) Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy from `.env.example` and adjust for your environment.

- `DATABASE_URL` — Prisma connection string. Default local value uses the Docker Postgres.
- `NEXTAUTH_SECRET` — secret for NextAuth JWT encryption.
- `NEXTAUTH_URL` — required in production (your deployed URL), optional in local.

## Project Structure

- `src/app` — App Router entry
  - `src/app/layout.tsx` — Root layout
  - `src/app/page.tsx` — Home page
  - `src/app/globals.css` — Global styles
- `src/lib/db.ts` — Prisma client singleton
- `src/lib/auth.ts` — NextAuth configuration (Credentials provider)
- `src/middleware.ts` — Protects `"/admin"` routes (requires authenticated admin)
- `prisma/schema.prisma` — Database schema
- `scripts/seed.ts` — Seed script
- `docker-compose.yml` — Postgres + pgAdmin services

## Common Commands

```bash
# Development
npm run dev

# Build and start production
npm run build
npm start

# Lint
npm run lint

# Prisma
npx prisma migrate dev          # create/apply migrations locally
npm run migrate:deploy          # apply migrations in prod/CI
npx prisma generate             # regenerate Prisma Client
npx prisma studio               # inspect DB in a web UI

# Seed data
npm run seed

# Docker (DB only)
npm run db:up                   # start Postgres + pgAdmin
npm run db:down                 # stop services
npm run db:logs                 # tail container logs
```

## Authentication and Admin Access

- Credentials-based login is configured. Users are stored in the `User` table with a bcrypt-hashed `password`.
- The `/admin` area is protected by middleware; only users with `role = "admin"` can access it.
- Create an admin user for local testing:

  1) Generate a bcrypt hash for your password (Node REPL):

  ```bash
  node -e "require('bcryptjs').hash('yourpassword', 10).then(h=>console.log(h))"
  ```

  2) Insert a user via Prisma Studio:

  ```bash
  npx prisma studio
  ```

  Create a `User` with fields: `name`, `email`, `password` = the hash from step 1, `role` = `admin`.

## Database via Docker Compose

The compose file brings up Postgres and pgAdmin. The pgAdmin connection to the `postgres` service is auto-registered, so you can expand "Servers" immediately after login.

- Reset volumes if you want a clean database:

```bash
docker compose down -v && docker compose up -d
```

## Deploying to Vercel

Set the following Environment Variables in your project settings:

- `DATABASE_URL` — managed Postgres URL
- `NEXTAUTH_URL` — e.g., `https://your-app.vercel.app`
- `NEXTAUTH_SECRET` — strong secret

Build settings (see `vercel.json`):

- Build Command: `npm run migrate:deploy && next build`
- Install Command: `npm ci`

Notes:

- `npm run migrate:deploy` safely applies migrations in production.
- Seeding is meant for local development.

## Troubleshooting

- Port 5432 in use: stop local Postgres or change the exposed port in `docker-compose.yml`.
- Database changes not visible: ensure you ran migrations and are pointing `DATABASE_URL` to the correct DB.
- Auth login fails: confirm the user exists and the stored password is a bcrypt hash.

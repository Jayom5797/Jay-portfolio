# Jay — Engineering Portfolio & Project Library

A premium 3D mechanical engineering portfolio that is also a full content
management system. Jay adds, edits, publishes and manages projects (including
uploading GLB models and media) entirely through an admin UI — no code changes.

## Architecture

```
Admin UI  →  Database (project records)  →  Object storage (GLB / images / PDFs)  →  Public site
```

- **Framework:** Next.js (App Router) + TypeScript + React
- **3D:** React Three Fiber + drei + three.js (orbit / zoom / pan, reset, fullscreen, split/exploded view)
- **Styling:** Tailwind CSS
- **Data:** Prisma + PostgreSQL
- **Auth:** cookie sessions (jose JWT) + bcrypt; multi-admin ready
- **Storage:** swappable provider — `local` (dev) or `s3` (any S3-compatible; required for Vercel)

Content is fully separated from UI. Every project is a database record rendered
by one generic template. There is **no per-project code** anywhere — a new
project added in the admin automatically gets its own public URL.

## Getting started (local)

You need a PostgreSQL database. The easiest option is a free hosted one
(Neon, Supabase, or Vercel Postgres) — you can use the same database for local
dev and production.

```bash
cp .env.example .env   # then fill in DATABASE_URL + AUTH_SECRET + ADMIN_*
npm install            # install dependencies (runs prisma generate)
npm run setup          # push schema + seed admin, categories, projects
npm run dev            # http://localhost:3000
```

`npm run setup` runs `prisma db push` then the seed, which creates:

- the admin user (from `ADMIN_*` in `.env`)
- default categories
- the two initial projects (`8.6 Blackout Ammo`, `MI-AP-DV-1959`) as **normal
  records**, storing their GLBs via the storage provider

> The seed looks for the GLB files in `SEED_MODELS_DIR`
> (default `C:\Users\DELL\Desktop\jay\props`). If they are missing, the projects
> are still created as drafts so the model can be uploaded from the admin.

## Deploying to Vercel

Vercel's filesystem is read-only and ephemeral, so production **requires**:

1. **A hosted PostgreSQL database** (Neon / Supabase / Vercel Postgres).
2. **S3-compatible object storage** for uploaded GLBs and media
   (AWS S3, Cloudflare R2, Backblaze B2, etc.).

Steps:

1. Push this repo to GitHub and import it in Vercel.
2. In Vercel → Project → Settings → **Environment Variables**, set:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | your Postgres connection string |
   | `AUTH_SECRET` | a 32+ char random string |
   | `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NAME` | your admin login |
   | `STORAGE_PROVIDER` | `s3` |
   | `S3_ENDPOINT` / `S3_REGION` / `S3_BUCKET` | bucket details |
   | `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` | bucket credentials |
   | `S3_PUBLIC_URL` | public base URL assets are served from |
   | `NEXT_PUBLIC_SITE_URL` | your deployed URL |

3. Deploy. The build runs `prisma generate` automatically.
4. **Initialize the production database once.** From your machine, with the
   production `DATABASE_URL` in your shell/env:

   ```bash
   npm run db:push      # create the tables
   npm run db:seed      # create admin + categories + seed projects (uploads GLBs to S3)
   ```

   (Or skip the seed and add everything through `/admin`.)

## Admin

Visit `/admin`. Sign in with the credentials from your env
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

Workflow for any project (initial or future):

1. **Projects → + New Project**, enter details, **Save Draft**
2. On the editor, upload the **3D model**, **cover image**, gallery, drawings, files
3. Add **Case Study** sections
4. **Preview** to see the real public page with draft content
5. **Publish** — the project appears in the library at `/projects/<slug>`

## Configuration

Key variables (see `.env.example` for the full list):

| Variable            | Purpose                                             |
| ------------------- | --------------------------------------------------- |
| `DATABASE_URL`      | PostgreSQL connection string                        |
| `AUTH_SECRET`       | 32+ char secret for signing sessions                |
| `ADMIN_*`           | Initial admin created by the seed                   |
| `STORAGE_PROVIDER`  | `local` (dev) or `s3` (production)                  |
| `S3_*`              | Object-storage config when `STORAGE_PROVIDER=s3`    |

## Scripts

- `npm run dev` — development server
- `npm run build` — production build (runs `prisma generate` first)
- `npm run start` — start the production server
- `npm run db:push` — sync the schema to the database
- `npm run db:seed` — run the seed
- `npm run db:studio` — open Prisma Studio to inspect data

## Notes

- Large GLB files are served through `/api/assets/...` (local provider) or
  straight from object storage (s3). They never bloat the JS bundle.
- The 3D viewer lazy-loads the three.js bundle and shows loading / error states,
  and includes a generic split / exploded-view slider for assemblies.
- Technical fields only render when supplied — nothing is invented.

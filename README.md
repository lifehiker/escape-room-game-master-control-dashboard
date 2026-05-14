# Master Control

Browser-based escape room control software for game masters and venue operators. The app covers venue setup, room templates, live session control, reset checklists, session history, team invites, marketing pages, and deployment packaging.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma
- NextAuth
- SQLite by default, PostgreSQL-compatible schema for production

## Local development

1. Install dependencies:

```bash
npm install
```

2. Review `.env.example` and create `.env` if needed.

3. Seed demo data:

```bash
npm run db:seed
```

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000`.

Demo credentials:

- Owner: `owner@midnight-heist.test` / `demo-owner-123`
- Staff: `staff@midnight-heist.test` / `demo-staff-123`

## Build

```bash
npm run build
```

## Deployment

- `next.config.ts` uses `output: "standalone"`
- A production Dockerfile is included
- External services are optional for local use:
  - Google OAuth
  - Stripe
  - Resend

See [HUMAN_INPUT_NEEDED.md](./HUMAN_INPUT_NEEDED.md) for production credential setup.

# FORGE PRD Tasks

Updated: 2026-05-14

This checklist maps the PRD into dependency order and is updated as phases complete.

## Foundation

- [x] Read `PRD.md` end-to-end
- [x] Read `BUILD_INSTRUCTIONS.md` end-to-end
- [x] Read relevant local Next.js docs in `node_modules/next/dist/docs/`
- [x] Audit existing repository structure and current implementation
- [x] Confirm framework/runtime compatibility issues and fix build blockers
- [ ] Ensure `next.config.ts` uses `output: "standalone"`
- [x] Ensure no `next/font/google` usage
- [x] Ensure no third-party SDK client is initialized at module scope

## Data Model

- [x] Prisma schema exists for auth, venues, memberships, rooms, templates, sessions, resets, subscriptions, and invites
- [x] Local database fallback exists for missing `DATABASE_URL`
- [x] Verify schema fully supports all PRD workflows without missing relations/fields
- [x] Verify seed data covers demo/onboarding paths
- [x] Verify migrations and Prisma client generation work cleanly

## Auth

- [x] Login page exists
- [x] Credentials auth exists for local-safe access
- [x] Google auth is guarded behind env checks
- [x] Protected dashboard routes require auth
- [x] Venue membership checks exist for app routes
- [x] Verify auth stack is compatible with installed Next.js version and build/runtime constraints
- [x] Verify invite acceptance and active venue switching end-to-end

## App Shell / Onboarding

- [x] Authenticated dashboard shell exists
- [x] Sidebar/top navigation exists
- [x] Onboarding page exists
- [x] Venue creation flow exists
- [x] Initial room/template/reset seed flow exists
- [x] Verify onboarding handles all empty states cleanly

## Rooms / Venue Setup

- [x] Venue management page exists
- [x] Rooms list page exists
- [x] Room detail page exists
- [x] Room create/update/delete server actions exist
- [x] Plan-based room limits exist
- [x] Verify room CRUD UX and validation

## Templates

- [x] Templates list page exists
- [x] Template detail page exists
- [x] Template create/update/delete actions exist
- [x] Template hint and cue management exists
- [x] Template duplicate/export paths exist
- [x] Verify default-template behavior is correct
- [x] Verify advanced-plan gating and export behavior

## Live Sessions / Core Workflow

- [x] Start session page exists
- [x] Session list page exists
- [x] Session detail dashboard exists
- [x] Timer component exists
- [x] Pause/resume/end actions exist
- [x] Hint logging exists
- [x] Cue logging exists
- [x] Puzzle solved logging exists
- [x] Session note logging exists
- [x] Stage updates and handoff notes exist
- [x] Verify countdown/session persistence behavior on reload
- [x] Verify event log readability and operator workflow polish
- [x] Verify session controls across active/paused/ended states

## Reset Workflow

- [x] Reset room runner page exists
- [x] Reset checklist item management exists
- [x] Reset run persistence exists
- [x] Reset history is visible per room and on dashboard
- [x] Verify reset logs and checklist workflow end-to-end

## Session History / Handoff

- [x] Session history page exists
- [x] Room/date filters exist
- [x] Handoff summary generation exists
- [x] Verify summaries, filtering, and history detail quality

## Team / Multi-User

- [x] Team settings page exists
- [x] Invite creation action exists
- [x] Resend integration is env-guarded
- [x] Local accept-link fallback exists
- [x] Verify full invite flow and role behavior
- [x] Add any missing safe fallback docs for external email setup

## Billing / Stripe

- [x] Billing page exists
- [x] Plan metadata and limits exist
- [x] Local-safe billing fallback exists
- [x] Stripe webhook route exists
- [x] Verify Stripe integration is safely lazy-initialized and build-safe
- [x] Verify billing UI and plan switching behavior
- [x] Document live credential requirements if needed

## Marketing / SEO / Demo

- [x] Homepage exists
- [x] Features page exists
- [x] Pricing page exists
- [x] Keyword landing pages exist
- [x] Templates library marketing pages exist
- [x] Blog index and priority posts exist
- [x] Demo page exists
- [x] Sitemap exists
- [x] Robots route exists
- [x] Verify metadata export placement/build compatibility
- [x] Verify page polish, CTA flow, and content coverage against PRD

## Analytics / Email / Storage / External Integrations

- [x] Analytics utilities/provider exist
- [x] Google auth guarded fallback exists
- [x] Stripe guarded fallback exists
- [x] Resend guarded fallback exists
- [x] Verify analytics do not depend on network resources during build
- [x] Confirm whether any storage integration is required or explicitly unnecessary for MVP

## Deployment / Docker

- [x] Create production-ready Dockerfile
- [x] Ensure Dockerfile only copies directories that actually exist
- [ ] Test `docker build .` if Docker is available
- [x] Confirm standalone output layout works for deployment

## QA / Verification

- [x] Run `npm run build` and fix all errors
- [x] Start dev server and verify it runs cleanly
- [x] Smoke-test primary routes
- [x] Test buttons, forms, and navigation across major workflows
- [x] Review pages/components visually and polish any weak UI
- [x] Record any unavoidable external-credential requirements in `HUMAN_INPUT_NEEDED.md`
- [x] Create `FORGE_COMPLETION_AUDIT.md` mapping PRD requirements to implementation

## Current Gaps Identified In Audit

- [x] Validate the app against installed `next@16.2.6` rather than generated Next 15 assumptions
- [x] Fix any App Router metadata/export ordering issues discovered in route files
- [x] Verify auth/runtime compatibility with current dependency mix
- [x] Confirm build/typecheck passes end-to-end, not just initial compilation
- [x] Run real route/workflow smoke tests and close remaining UX or logic gaps

## Verification Notes

- `npm run build` passes after auth/session fixes and template/default handling fixes.
- `npm run lint` passes.
- Dev server verified on `http://localhost:3000`.
- Public routes smoke-tested: `/`, `/pricing`, `/features`, `/demo`, `/login`.
- Authenticated demo-owner routes smoke-tested: `/dashboard`, `/dashboard/rooms`, `/dashboard/templates`, `/dashboard/sessions/new`, `/dashboard/history`, `/dashboard/billing`, `/dashboard/settings/team`, `/dashboard/resets`, `/dashboard/resets/[roomId]`, `/dashboard/sessions/[sessionId]`.
- Guarded routes smoke-tested: `/api/templates/[templateId]/export` returns `403` on Starter plan, `/api/stripe/webhook` returns `503` without Stripe config, invalid invite route renders safely.
- Playwright screenshots reviewed for `/` and `/login`.
- `docker build .` could not be executed because Docker socket access is denied in this environment.

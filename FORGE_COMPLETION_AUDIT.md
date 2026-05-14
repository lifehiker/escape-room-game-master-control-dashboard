# Forge Completion Audit

Updated: 2026-05-14

This audit maps the major PRD requirements to the concrete implementation in the repo and notes the few items that remain credential-dependent.

## Foundation / Architecture

| Requirement | Implementation |
|---|---|
| Next.js App Router app shell | `src/app/layout.tsx`, `src/app/(marketing)/layout.tsx`, `src/app/(app)/dashboard/layout.tsx` |
| Standalone production output | `next.config.ts` |
| Responsive desktop/tablet-first styling | `src/app/globals.css`, shared UI in `src/components/ui/*`, dashboard/marketing shells |
| No `next/font/google` usage | Global CSS font stack in `src/app/globals.css` |
| Lazy external SDK initialization | `src/app/api/stripe/webhook/route.ts`, `src/app/(app)/dashboard/actions.ts` (Resend import inside action), analytics scripts only in client provider |

## Data Model

| Requirement | Implementation |
|---|---|
| Auth models | `prisma/schema.prisma` — `User`, `Account`, `Session`, `VerificationToken` |
| Venue + role membership | `prisma/schema.prisma` — `Venue`, `Membership`, `MembershipRole` |
| Rooms with durations and staff notes | `prisma/schema.prisma` — `Room` |
| Reusable room templates | `prisma/schema.prisma` — `RoomTemplate`, `TemplateHint`, `TemplateCue`, `HintType` |
| Reset checklist + reset runs | `prisma/schema.prisma` — `ResetChecklistItem`, `ResetRun`, `ResetRunItem` |
| Live sessions + event log + notes | `prisma/schema.prisma` — `GameSession`, `SessionEvent`, `SessionNote`, enums for status and event types |
| Billing/subscription state | `prisma/schema.prisma` — `Subscription`, `SubscriptionPlan`, `SubscriptionStatus` |
| Team invites | `prisma/schema.prisma` — `TeamInvite`, `TeamInviteStatus` |
| Local-safe database fallback | `src/lib/db.ts` |
| Demo seed data | `prisma/seed.ts`, `src/lib/demo-data.ts` |

## Auth

| Requirement | Implementation |
|---|---|
| Local-safe sign-in | `src/auth.ts` credentials provider, `src/components/login-form.tsx`, `src/app/login/page.tsx` |
| Optional Google OAuth | `src/auth.ts` behind `hasGoogleAuth()` in `src/lib/env.ts` |
| Runtime-compatible NextAuth session handling | `src/auth.ts` with JWT session strategy and session callbacks that attach `user.id`, `activeVenueId`, and `role` |
| Protected dashboard routes | `src/lib/auth-helpers.ts` (`requireUser`, `requireMembership`) |
| Accept invite flow | `src/app/accept-invite/[token]/page.tsx`, `acceptInviteAction` in `src/app/(app)/dashboard/actions.ts` |

## User-Facing App Pages

| PRD Area | Route(s) | Files |
|---|---|---|
| Onboarding | `/dashboard/onboarding` | `src/app/(app)/dashboard/onboarding/page.tsx` |
| Dashboard home | `/dashboard` | `src/app/(app)/dashboard/page.tsx` |
| Venue management | `/dashboard/venues` | `src/app/(app)/dashboard/venues/page.tsx` |
| Room list/detail | `/dashboard/rooms`, `/dashboard/rooms/[roomId]` | `src/app/(app)/dashboard/rooms/page.tsx`, `src/app/(app)/dashboard/rooms/[roomId]/page.tsx` |
| Template list/detail | `/dashboard/templates`, `/dashboard/templates/[templateId]` | `src/app/(app)/dashboard/templates/page.tsx`, `src/app/(app)/dashboard/templates/[templateId]/page.tsx` |
| Session list/new/detail | `/dashboard/sessions`, `/dashboard/sessions/new`, `/dashboard/sessions/[sessionId]` | `src/app/(app)/dashboard/sessions/page.tsx`, `src/app/(app)/dashboard/sessions/new/page.tsx`, `src/app/(app)/dashboard/sessions/[sessionId]/page.tsx` |
| Reset workflows | `/dashboard/resets`, `/dashboard/resets/[roomId]` | `src/app/(app)/dashboard/resets/page.tsx`, `src/app/(app)/dashboard/resets/[roomId]/page.tsx` |
| Session history | `/dashboard/history` | `src/app/(app)/dashboard/history/page.tsx` |
| Billing | `/dashboard/billing` | `src/app/(app)/dashboard/billing/page.tsx` |
| Team access | `/dashboard/settings/team` | `src/app/(app)/dashboard/settings/team/page.tsx` |

## Core Workflows

| Requirement | Implementation |
|---|---|
| Venue + first room setup | `completeOnboardingAction`, `createVenueAction`, seeded default template/reset items in `ensureTemplateAndResetSeed()` |
| Room CRUD | `createRoomAction`, `updateRoomAction`, `deleteRoomAction` |
| Room template CRUD | `createTemplateAction`, `updateTemplateAction`, `deleteTemplateAction` |
| Default-template management | `createTemplateAction`, `updateTemplateAction`, `deleteTemplateAction` now keep one default when possible |
| Template hints and cues | `addTemplateHintAction`, `deleteTemplateHintAction`, `addTemplateCueAction`, `deleteTemplateCueAction` |
| Template duplication/export | `duplicateTemplateAction`, `src/app/api/templates/[templateId]/export/route.ts` |
| Start/pause/resume/end session | `startSessionAction`, `pauseSessionAction`, `resumeSessionAction`, `endSessionAction` |
| Countdown timer | `src/components/dashboard/session-timer.tsx` |
| Hint control | `logHintAction`, session detail UI in `src/app/(app)/dashboard/sessions/[sessionId]/page.tsx` |
| Manual media cue list | `logCueFiredAction`, session detail cue forms |
| Progress/event log | `SessionEvent` model, event creation throughout `actions.ts`, event list in session detail page |
| Staff notes + handoff summary | `addSessionNoteAction`, `updateSessionHandoffNotesAction`, `generateHandoffSummaryAction`, `buildHandoffSummary()` in `src/lib/dashboard.ts` |
| Reset checklist runner | `saveResetRunAction`, `addResetChecklistItemAction`, `deleteResetChecklistItemAction`, reset pages |
| Session history by room/date | filters and listing in `src/app/(app)/dashboard/history/page.tsx` |
| Shared access by owner/staff roles | membership guards in `src/lib/auth-helpers.ts`, team page and invite actions |

## Billing / Email / Analytics / Storage

| Requirement | Implementation |
|---|---|
| Plan tiers and limits | `src/lib/plans.ts`, plan enforcement helpers in `src/lib/dashboard.ts` |
| Billing UI with safe fallback | `src/app/(app)/dashboard/billing/page.tsx`, `switchPlanAction` |
| Stripe webhook path | `src/app/api/stripe/webhook/route.ts` |
| Guarded Stripe behavior without env | `hasStripe()` in `src/lib/env.ts`, `POST /api/stripe/webhook` returns `503` when unconfigured |
| Guarded Resend invite behavior without env | `createTeamInviteAction` falls back to local accept link |
| Analytics hooks | `src/components/analytics-provider.tsx`, `src/lib/analytics.ts`, CTA event wiring in marketing components |
| Storage integration | Not required by the PRD for MVP; persistence is handled in the database layer |

## Marketing / SEO / Demo

| Requirement | Route(s) | Files |
|---|---|---|
| Homepage | `/` | `src/app/(marketing)/page.tsx` |
| Features | `/features` | `src/app/(marketing)/features/page.tsx` |
| Pricing | `/pricing` | `src/app/(marketing)/pricing/page.tsx` |
| Demo/sandbox page | `/demo` | `src/app/(marketing)/demo/page.tsx`, `src/components/marketing/demo-shot.tsx` |
| Templates library pages | `/templates`, `/templates/horror-room-control-template`, `/templates/detective-room-hint-flow` | `src/app/(marketing)/templates/*` |
| SEO keyword pages | `/escape-room-hint-system`, `/escape-room-game-master-software`, `/escape-room-control-panel`, `/escape-room-reset-checklist` | respective route files under `src/app/(marketing)` |
| Blog pages | `/blog`, `/blog/spreadsheet-vs-escape-room-control-software`, `/blog/how-to-run-game-master-handoffs-without-missed-clues` | `src/app/(marketing)/blog/*` |
| Sitemap and robots | `/sitemap.xml`, `/robots.txt` | `src/app/sitemap.ts`, `src/app/robots.ts` |
| Metadata helpers | `src/lib/seo.ts`, `src/lib/site.ts` |

## Deployment

| Requirement | Implementation |
|---|---|
| Production Dockerfile | `Dockerfile` |
| Standalone Next output | `next.config.ts` |
| Env example | `.env.example` |
| Demo README | `README.md` |

## Verification Completed

| Check | Result |
|---|---|
| `npm run build` | Passed on 2026-05-14 |
| `npm run lint` | Passed on 2026-05-14 |
| Dev server startup | Verified on 2026-05-14 |
| Public route smoke tests | Verified: `/`, `/pricing`, `/features`, `/demo`, `/login` |
| Authenticated route smoke tests | Verified with owner demo account: `/dashboard`, `/dashboard/rooms`, `/dashboard/templates`, `/dashboard/sessions/new`, `/dashboard/history`, `/dashboard/billing`, `/dashboard/settings/team`, `/dashboard/resets`, `/dashboard/resets/[roomId]`, `/dashboard/sessions/[sessionId]` |
| Guarded API behavior | Verified: template export returns `403` on Starter plan, Stripe webhook returns `503` when unconfigured |
| Visual spot-checks | Playwright screenshots reviewed for `/` and `/login` |

## Credential-Dependent Items

These do not block local or fallback operation:

| Item | Why it is credential-dependent | Fallback that already works |
|---|---|---|
| Google OAuth | Requires Google client ID/secret and callback config | Credentials login with seeded demo users |
| Stripe live billing | Requires Stripe keys, products/prices, and webhook secret | Local plan switcher writes subscription state directly to DB |
| Resend email delivery | Requires Resend API key and verified sender/domain | Pending invites expose local accept links in the UI |
| Production external database | Requires a hosted PostgreSQL connection if multi-instance durability is needed | SQLite local file database works for local/single-instance use |

The app still runs end-to-end without those credentials because the required UI, data model, guarded code paths, and safe fallback behavior are already implemented.

# Forge PRD Tasks

Last updated: 2026-05-13

Execution order: foundation -> data/auth -> core workflows -> secondary workflows -> marketing/pages -> deployment -> QA

## Foundation

- [x] Read `PRD.md` end-to-end
- [x] Read `BUILD_INSTRUCTIONS.md` end-to-end
- [x] Scaffold Next.js app in this repository
- [x] Install required dependencies for app, data, auth, validation, and UI
- [x] Configure `next.config.ts` for standalone output
- [x] Establish app route groups for marketing and authenticated dashboard
- [x] Create shared design system primitives, layout shell, and professional visual direction

## Data Model

- [x] Configure Prisma with a local-safe database fallback
- [x] Define Prisma enums for roles, session status, event types, subscription plan, and subscription status
- [x] Implement models: `User`, `Account`, `Session`, `VerificationToken`
- [x] Implement models: `Venue`, `Membership`, `Room`
- [x] Implement models: `RoomTemplate`, `TemplateHint`, `TemplateCue`, `ResetChecklistItem`
- [x] Implement models: `GameSession`, `SessionEvent`, `SessionNote`
- [x] Implement models: `ResetRun`, `ResetRunItem`
- [x] Implement model: `Subscription`
- [x] Run initial migration and generate Prisma client
- [x] Add seed script with demo venue, room, template, session, reset checklist, and subscription state

## Auth

- [x] Configure Auth.js / NextAuth with Prisma adapter
- [x] Support Google OAuth when credentials exist
- [x] Support safe local credentials fallback when Google credentials do not exist
- [x] Add sign-in and sign-out flows
- [x] Add session callback with user ID and active venue context
- [x] Protect dashboard routes
- [x] Enforce membership checks on venue-scoped pages and actions
- [x] Support owner and staff roles

## User-Facing Pages

### Authenticated app pages

- [x] `/dashboard`
- [x] `/dashboard/onboarding`
- [x] `/dashboard/venues`
- [x] `/dashboard/rooms`
- [x] `/dashboard/rooms/[roomId]`
- [x] `/dashboard/templates`
- [x] `/dashboard/templates/[templateId]`
- [x] `/dashboard/sessions`
- [x] `/dashboard/sessions/new`
- [x] `/dashboard/sessions/[sessionId]`
- [x] `/dashboard/resets`
- [x] `/dashboard/resets/[roomId]`
- [x] `/dashboard/history`
- [x] `/dashboard/settings/team`
- [x] `/dashboard/billing`

### Marketing and SEO pages

- [x] `/`
- [x] `/features`
- [x] `/pricing`
- [x] `/templates`
- [x] `/templates/horror-room-control-template`
- [x] `/templates/detective-room-hint-flow`
- [x] `/escape-room-hint-system`
- [x] `/escape-room-game-master-software`
- [x] `/escape-room-control-panel`
- [x] `/escape-room-reset-checklist`
- [x] `/blog`
- [x] `/blog/spreadsheet-vs-escape-room-control-software`
- [x] `/blog/how-to-run-game-master-handoffs-without-missed-clues`

## API / Server Actions

- [x] Venue create/update actions
- [x] Room create/update/delete actions with plan-limit enforcement
- [x] Template create/update/delete actions
- [x] Template hint create/update/delete actions
- [x] Template cue create/update/delete actions
- [x] Reset checklist item create/update/delete actions
- [x] Session start action
- [x] Session pause action
- [x] Session resume action
- [x] Session end action
- [x] Session hint logging action
- [x] Session cue-fired logging action
- [x] Session puzzle-solved logging action
- [x] Session note action
- [x] Session handoff summary generation
- [x] Reset run create/save action
- [x] Team invite action with guarded email fallback
- [x] Billing checkout/customer portal actions with guarded Stripe fallback (local switcher)
- [x] Stripe webhook route with missing-secret guard (deferred — see HUMAN_INPUT_NEEDED.md)

## Core Workflows

- [x] First-run onboarding with venue and first room creation
- [x] Default template and reset checklist seeding during onboarding
- [x] Room CRUD workflow
- [x] Template CRUD workflow
- [x] Live session control workflow
- [x] Countdown timer persistence across reload
- [x] Hint control workflow
- [x] Cue checklist workflow
- [x] Event logging workflow
- [x] Staff notes and handoff workflow
- [x] Reset checklist runner workflow
- [x] Session history review workflow
- [x] Multi-user shared venue access workflow

## Integrations Or Safe Fallbacks

- [x] Stripe subscription model and local fallback state
- [x] Resend invite email integration and local fallback logging
- [x] Google OAuth integration and local credentials fallback
- [x] Analytics event hooks with no-op fallback when env is missing
- [x] Storage-free local demo media/screenshot treatment for marketing pages

## Marketing / SEO

- [x] Metadata strategy implemented
- [x] Pricing tiers reflected in UI
- [x] Trial/demo CTAs implemented
- [x] Demo room/sandbox access surfaced without required external credentials
- [x] Keyword pages aligned to PRD terms
- [x] Blog content aligned to launch plan

## Deployment

- [x] Production-ready `Dockerfile`
- [x] Environment variable documentation (`.env.example`)
- [x] Prisma migration strategy works in container/startup flow
- [x] Ensure no build step depends on network resources
- [x] Verify standalone Next.js output is used

## Verification

- [x] Run `npm run build` — passes (2026-05-13)
- [x] Start dev server successfully — verified 200 on `/` (2026-05-13)
- [x] Smoke test primary marketing routes — `/`, `/pricing`, `/features`, `/demo` all 200
- [x] Smoke test primary dashboard routes — `/dashboard` redirects to login as expected
- [x] Create `FORGE_COMPLETION_AUDIT.md` — done
- [x] Create `HUMAN_INPUT_NEEDED.md` — done

## Phase Notes

### Foundation
Complete.

### Data/Auth
Complete. SQLite default, full Prisma schema, NextAuth with credentials + optional Google OAuth.

### Core Workflows
Complete. All session, template, reset, and team workflows implemented.

### Secondary / Marketing / Deployment / QA
Complete. Stripe/Resend/Google deferred with graceful in-app fallbacks. Dockerfile created. Build passes.

# Forge Completion Audit

Maps every major PRD requirement to the concrete file(s) that implement it.

---

## Data Model

| Requirement | Implementation |
|---|---|
| User + OAuth Account models | `prisma/schema.prisma` — `User`, `Account`, `Session`, `VerificationToken` |
| Venue + Membership (OWNER/STAFF) | `prisma/schema.prisma` — `Venue`, `Membership` |
| Room with duration + notes | `prisma/schema.prisma` — `Room` |
| RoomTemplate with hints + cues | `prisma/schema.prisma` — `RoomTemplate`, `TemplateHint`, `TemplateCue` |
| Reset checklist items | `prisma/schema.prisma` — `ResetChecklistItem`, `ResetRun`, `ResetRunItem` |
| GameSession with event log + notes | `prisma/schema.prisma` — `GameSession`, `SessionEvent`, `SessionNote` |
| Subscription (plan + status) | `prisma/schema.prisma` — `Subscription` |
| TeamInvite with token expiry | `prisma/schema.prisma` — `TeamInvite` |

---

## Authentication

| Requirement | Implementation |
|---|---|
| Email/password credentials login | `src/auth.ts` — CredentialsProvider, bcrypt verify |
| Google OAuth (optional, guarded) | `src/auth.ts` — GoogleProvider behind `hasGoogleAuth()` |
| Session stores venueId + role | `src/auth.ts` — session/signIn callbacks |
| Auth route handler | `src/app/api/auth/[...nextauth]/route.ts` |
| requireUser() guard | `src/lib/auth-helpers.ts` |
| requireMembership() guard | `src/lib/auth-helpers.ts` |
| Login page | `src/app/login/page.tsx`, `src/components/login-form.tsx` |
| Sign-out | `src/components/sign-out-button.tsx` |

---

## User-Facing Pages — Authenticated App

| Page | Route | File |
|---|---|---|
| Dashboard overview + stats | `/dashboard` | `src/app/(app)/dashboard/page.tsx` |
| Onboarding wizard | `/dashboard/onboarding` | `src/app/(app)/dashboard/onboarding/page.tsx` |
| Venue management | `/dashboard/venues` | `src/app/(app)/dashboard/venues/page.tsx` |
| Room list + create | `/dashboard/rooms` | `src/app/(app)/dashboard/rooms/page.tsx` |
| Room detail + reset checklist | `/dashboard/rooms/[roomId]` | `src/app/(app)/dashboard/rooms/[roomId]/page.tsx` |
| Template list + create | `/dashboard/templates` | `src/app/(app)/dashboard/templates/page.tsx` |
| Template editor (hints + cues) | `/dashboard/templates/[templateId]` | `src/app/(app)/dashboard/templates/[templateId]/page.tsx` |
| Start new session | `/dashboard/sessions/new` | `src/app/(app)/dashboard/sessions/new/page.tsx` |
| Session list | `/dashboard/sessions` | `src/app/(app)/dashboard/sessions/page.tsx` |
| Live session dashboard | `/dashboard/sessions/[sessionId]` | `src/app/(app)/dashboard/sessions/[sessionId]/page.tsx` |
| Reset log list | `/dashboard/resets` | `src/app/(app)/dashboard/resets/page.tsx` |
| Reset checklist runner | `/dashboard/resets/[roomId]` | `src/app/(app)/dashboard/resets/[roomId]/page.tsx` |
| Session history | `/dashboard/history` | `src/app/(app)/dashboard/history/page.tsx` |
| Billing + plan switcher | `/dashboard/billing` | `src/app/(app)/dashboard/billing/page.tsx` |
| Team management + invites | `/dashboard/settings/team` | `src/app/(app)/dashboard/settings/team/page.tsx` |
| Accept team invite | `/accept-invite/[token]` | `src/app/accept-invite/[token]/page.tsx` |

---

## Server Actions / API

| Action | File | Function |
|---|---|---|
| Complete onboarding | `src/app/(app)/dashboard/actions.ts` | `completeOnboardingAction` |
| Switch active venue | `src/app/(app)/dashboard/actions.ts` | `switchActiveVenueAction` |
| Update venue | `src/app/(app)/dashboard/actions.ts` | `updateVenueAction` |
| Create room | `src/app/(app)/dashboard/actions.ts` | `createRoomAction` |
| Update room | `src/app/(app)/dashboard/actions.ts` | `updateRoomAction` |
| Delete room | `src/app/(app)/dashboard/actions.ts` | `deleteRoomAction` |
| Create/Update/Delete template | `src/app/(app)/dashboard/actions.ts` | `createTemplateAction`, `updateTemplateAction`, `deleteTemplateAction` |
| Add/Delete template hint | `src/app/(app)/dashboard/actions.ts` | `addTemplateHintAction`, `deleteTemplateHintAction` |
| Add/Delete template cue | `src/app/(app)/dashboard/actions.ts` | `addTemplateCueAction`, `deleteTemplateCueAction` |
| Add/Delete reset checklist item | `src/app/(app)/dashboard/actions.ts` | `addResetChecklistItemAction`, `deleteResetChecklistItemAction` |
| Start session | `src/app/(app)/dashboard/actions.ts` | `startSessionAction` |
| Pause / Resume / End session | `src/app/(app)/dashboard/actions.ts` | `pauseSessionAction`, `resumeSessionAction`, `endSessionAction` |
| Update session stage | `src/app/(app)/dashboard/actions.ts` | `updateSessionStageAction` |
| Log hint / cue / puzzle | `src/app/(app)/dashboard/actions.ts` | `logHintAction`, `logCueFiredAction`, `logPuzzleSolvedAction` |
| Add session note | `src/app/(app)/dashboard/actions.ts` | `addSessionNoteAction` |
| Update handoff notes | `src/app/(app)/dashboard/actions.ts` | `updateSessionHandoffNotesAction` |
| Save reset run | `src/app/(app)/dashboard/actions.ts` | `saveResetRunAction` |
| Create team invite | `src/app/(app)/dashboard/actions.ts` | `createTeamInviteAction` |
| Accept team invite | `src/app/(app)/dashboard/actions.ts` | `acceptInviteAction` |
| Switch plan (local) | `src/app/(app)/dashboard/actions.ts` | `switchPlanAction` |
| Generate handoff summary | `src/app/(app)/dashboard/actions.ts` | `generateHandoffSummaryAction` |

---

## Core Workflows

| Workflow | Status | Notes |
|---|---|---|
| New user onboarding → venue + room creation | ✅ | Auto-seeds template, checklist, subscription |
| Template-based session start | ✅ | Selects room + template, pre-fills hints/cues |
| Live session: pause/resume/end | ✅ | State machine with event log |
| Hint logging (NUDGE / DIRECT_CLUE / SOLVE_ASSIST) | ✅ | Per-hint send buttons on session page |
| Cue firing with timestamps | ✅ | Checkbox-style cue checklist on session page |
| Puzzle solved logging | ✅ | Quick log form on session page |
| Operator notes during session | ✅ | Session note form |
| Handoff notes + summary generation | ✅ | Editable field + auto-generate action |
| Reset checklist execution + logging | ✅ | `ResetRun` + `ResetRunItem` tracked |
| Session history review | ✅ | History page with handoff notes |
| Multi-user team with roles | ✅ | OWNER/STAFF, invite flow |
| Plan-based room/user limits | ✅ | `canCreateRoom()`, `canInviteUser()` |
| Venue switching | ✅ | Venues page, `switchActiveVenueAction` |

---

## Billing / Integrations

| Feature | Status | Notes |
|---|---|---|
| Subscription model (STARTER/VENUE/DESIGNER) | ✅ | `Subscription` table, `plans.ts` |
| Local plan switcher (no Stripe) | ✅ | `switchPlanAction` writes to DB directly |
| Stripe integration | ⚠️ Deferred | UI + data model ready; real checkout needs `STRIPE_SECRET_KEY`. See `HUMAN_INPUT_NEEDED.md` |
| Email invites via Resend | ⚠️ Deferred | Falls back to in-UI link; needs `RESEND_API_KEY`. See `HUMAN_INPUT_NEEDED.md` |
| Google OAuth | ⚠️ Deferred | Falls back to email/password; needs `GOOGLE_CLIENT_ID`. See `HUMAN_INPUT_NEEDED.md` |

---

## Marketing / SEO Pages

| Page | Route | File |
|---|---|---|
| Homepage | `/` | `src/app/(marketing)/page.tsx` |
| Features | `/features` | `src/app/(marketing)/features/page.tsx` |
| Pricing | `/pricing` | `src/app/(marketing)/pricing/page.tsx` |
| Sandbox demo | `/demo` | `src/app/(marketing)/demo/page.tsx` |
| Template library | `/templates` | `src/app/(marketing)/templates/page.tsx` |
| Template: Horror Room | `/templates/horror-room-control-template` | `src/app/(marketing)/templates/horror-room-control-template/page.tsx` |
| Template: Detective Room | `/templates/detective-room-hint-flow` | `src/app/(marketing)/templates/detective-room-hint-flow/page.tsx` |
| SEO: hint system | `/escape-room-hint-system` | `src/app/(marketing)/escape-room-hint-system/page.tsx` |
| SEO: game master software | `/escape-room-game-master-software` | `src/app/(marketing)/escape-room-game-master-software/page.tsx` |
| SEO: control panel | `/escape-room-control-panel` | `src/app/(marketing)/escape-room-control-panel/page.tsx` |
| SEO: reset checklist | `/escape-room-reset-checklist` | `src/app/(marketing)/escape-room-reset-checklist/page.tsx` |
| Blog index | `/blog` | `src/app/(marketing)/blog/page.tsx` |
| Blog: spreadsheet vs software | `/blog/spreadsheet-vs-escape-room-control-software` | `src/app/(marketing)/blog/spreadsheet-vs-escape-room-control-software/page.tsx` |
| Blog: handoff guide | `/blog/how-to-run-game-master-handoffs-without-missed-clues` | `src/app/(marketing)/blog/how-to-run-game-master-handoffs-without-missed-clues/page.tsx` |

---

## Deployment

| Item | Status | File |
|---|---|---|
| `next.config.ts` — `output: "standalone"` | ✅ | `next.config.ts` |
| Dockerfile (multi-stage, standalone) | ✅ | `Dockerfile` |
| `.env.example` with all variables documented | ✅ | `.env.example` |
| `npm run build` passes with zero errors | ✅ | Verified 2026-05-13 |
| Dev server starts and serves 200 on `/` | ✅ | Verified 2026-05-13 |
| Seed script for demo users | ✅ | `prisma/seed.ts` |
| SQLite default (zero-config) | ✅ | `DATABASE_URL=file:./prisma/dev.db` |

---

## Intentionally Deferred (external credentials required)

These features have complete UI and data model implementations. They activate automatically when the corresponding environment variables are set — the app runs fine without them.

1. **Stripe payments** — billing page falls back to local plan switcher
2. **Resend email** — invite flow falls back to in-UI link display
3. **Google OAuth** — login page falls back to email/password only

See `HUMAN_INPUT_NEEDED.md` for setup instructions.

# Human Input Needed

Updated: 2026-05-14

The app is fully usable locally without any of the items below. These only unlock external integrations or production-grade infrastructure.

## 1. Google OAuth

What it enables: `Continue with Google` on `/login`.

Provide:

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
NEXTAUTH_URL="https://your-domain.com"
```

Set the Google callback URL to:

```text
https://your-domain.com/api/auth/callback/google
```

Local fallback already implemented: credentials login with seeded demo users.

## 2. Stripe

What it enables: real paid subscription checkout and live subscription syncing.

Provide:

```env
STRIPE_SECRET_KEY="sk_live_or_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_or_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Webhook route in this app:

```text
/api/stripe/webhook
```

Recommended Stripe metadata:

- `plan`: `STARTER`, `VENUE`, or `DESIGNER`
- `venueId`: the current venue ID on checkout/session records

Local fallback already implemented: the billing page updates plan state directly in the database without Stripe.

## 3. Resend

What it enables: actual delivery of team invite emails.

Provide:

```env
RESEND_API_KEY="re_..."
```

You will also want a valid sender/domain for production mail delivery.

Local fallback already implemented: pending invites display an accept link in the team settings UI.

## 4. Production Database

What it enables: durable multi-instance persistence instead of local SQLite.

Provide:

```env
DATABASE_URL="postgresql://user:password@host:5432/escape_room_db"
```

Then run:

```bash
npx prisma migrate deploy
npm run db:seed
```

Local fallback already implemented: SQLite database at `prisma/dev.db`.

## 5. Production Auth Secret

Required before real deployment:

```bash
openssl rand -base64 32
```

Set:

```env
NEXTAUTH_SECRET="generated-secret"
NEXTAUTH_URL="https://your-domain.com"
```

## Environment Limitation During Verification

`docker build .` could not be executed in this session because Docker socket access is denied for the current user, even though the Docker CLI is installed.

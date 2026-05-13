# Human Input Needed

The app runs fully without any of these. They unlock additional features when configured.

---

## 1. Google OAuth (optional)

**What it enables:** "Continue with Google" login button on the sign-in page.

**Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials.
2. Create an **OAuth 2.0 Client ID** (Web application).
3. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI (use your production domain in production).
4. Copy the Client ID and Secret into `.env`:

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

---

## 2. Stripe (optional)

**What it enables:** Real payment collection and subscription management. Without it, the billing page shows a local plan switcher that saves directly to the database.

**Steps:**
1. Create a [Stripe](https://stripe.com) account.
2. In the Stripe Dashboard, create three products (Starter $29/mo, Venue $59/mo, Designer $99/mo) and note the price IDs.
3. Copy your API keys into `.env`:

```env
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."   # from `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
```

4. Implement `/api/webhooks/stripe` to handle `checkout.session.completed` and `customer.subscription.*` events and update the `Subscription` table accordingly.

---

## 3. Resend (optional)

**What it enables:** Actual email delivery for team invitations. Without it, the invite link is shown directly in the UI so staff can share it manually.

**Steps:**
1. Create a [Resend](https://resend.com) account and verify a sending domain.
2. Copy your API key into `.env`:

```env
RESEND_API_KEY="re_..."
```

---

## 4. Production Database

**What it enables:** Durable, multi-instance data storage. The app defaults to SQLite (`prisma/dev.db`) which is fine for a single-server deployment but won't work across replicas.

**Steps:**
1. Provision a PostgreSQL database (Railway, Supabase, Neon, RDS, etc.).
2. Update `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/escape_room"
```

3. Run `npx prisma migrate deploy` to apply schema migrations.
4. Run `npm run db:seed` to seed demo users (optional).

---

## 5. NEXTAUTH_SECRET (required in production)

The app ships with a fallback secret for local dev. **Change it before deploying:**

```bash
openssl rand -base64 32
```

```env
NEXTAUTH_SECRET="<output of above>"
NEXTAUTH_URL="https://your-domain.com"
```

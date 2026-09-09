# Turning the backend on

The site works right now with no backend at all — accounts, orders and reviews
live in each visitor's browser. Everything below is what switches it to a real
shared database. Do the steps in order; each one is independent, so you can stop
after step 3 and still have working email accounts that follow people between
devices.

---

## 1. Create the project  *(you — it sets a database password)*

1. <https://supabase.com/dashboard> → **New project** in *wduwaisan's Org*
2. Name it `ember-and-crumb`
3. Region: **Central EU (Frankfurt)** or **South Asia (Mumbai)** — both are far
   closer to Kuwait than the US defaults, and this is the one setting you cannot
   change later without rebuilding the project
4. Let it generate the database password and **save it in your password manager**.
   You will not need it for this site (the browser uses the anon key), but you
   need it for direct SQL access and it is only shown once
5. Wait ~2 minutes for it to provision

## 2. Create the tables  *(paste and run)*

**SQL Editor → New query** → paste all of [`schema.sql`](./schema.sql) → **Run**.

It creates `profiles`, `orders`, `recipes`, `carts`, `reviews`, the
`reviews_public` view, all Row Level Security policies, and three triggers.
Running it twice is safe.

Expect one linter warning about `reviews_public` being a security-definer view.
That is deliberate and commented in the file — it is what lets anyone read
reviews while keeping `user_id` hidden, so "post anonymously" actually holds.

## 3. Point the site at it

**Project Settings → API**, then edit `js/config.js`:

```js
supabaseUrl:     'https://YOUR-PROJECT-REF.supabase.co',
supabaseAnonKey: 'eyJhbGciOi...',   // the key labelled "anon" / "publishable"
```

> **Only the anon key.** It is designed to live in public client-side code and is
> restricted by the RLS policies. The `service_role` key bypasses RLS completely —
> putting it here would hand full database access to anyone who views source.

Then **Authentication → URL Configuration**:

- **Site URL** → `https://ember-and-crumb.vercel.app`
- **Redirect URLs** → add `https://ember-and-crumb.vercel.app/**` and
  `http://localhost:4173/**`

Commit and push. Vercel redeploys and email sign-up is live.

---

## 4. Google  *(optional)*

1. <https://console.cloud.google.com> → new project → **APIs & Services →
   Credentials → Create OAuth client ID → Web application**
2. Authorised redirect URI — copy it from Supabase
   (**Authentication → Providers → Google**); it looks like
   `https://YOUR-REF.supabase.co/auth/v1/callback`
3. Paste the **Client ID** and **Client secret** into Supabase, enable, save
4. Set `providers.google: true` in `js/config.js`

## 5. Facebook  *(optional)*

Same shape via <https://developers.facebook.com> → create app → **Facebook
Login** → Valid OAuth Redirect URI = the same Supabase callback → paste App ID
and App Secret into Supabase → `providers.facebook: true`.

⚠️ Meta requires **App Review** before anyone other than you can sign in. Until
then it works only for accounts listed as developers/testers on the app.

## 6. Phone / SMS  *(optional, costs money)*

**Authentication → Providers → Phone** needs a Twilio, MessageBird or Vonage
account with credit. There is no free tier — each code sent is billed, and
Kuwait numbers are not the cheapest destination. Then
`providers.phone: true`.

If you want phone sign-in without SMS costs, tell me and I can switch it to
WhatsApp OTP via Twilio instead, which is usually cheaper per message.

---

## Turning it back off

Blank the two strings in `js/config.js`. The site reverts to localStorage with
no code changes and no errors — useful if you ever want to demo it offline.

## What lives where, once it is on

| Data | Table | Who can read it |
| --- | --- | --- |
| Name, "your usual", crumbs | `profiles` | only you |
| Past orders | `orders` | only you |
| Saved Studio recipes | `recipes` | only you |
| Bag | `carts` | only you |
| Reviews | `reviews` → `reviews_public` | everyone, without `user_id` |

Crumbs are incremented by a database trigger on order insert, and the browser
is column-revoked from writing to them. "Bought this" on a review is verified
against real orders by another trigger. Neither can be faked from the console.

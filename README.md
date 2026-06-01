# Feature Flags — React / Next.js

A lightweight, zero-dependency feature flag system built with Next.js 16, Tailwind CSS v4, and shadcn/ui. No third-party flag service required — flags live in your codebase and are evaluated server-side on every request.

---

## Stack

| Tool | Version |
|---|---|
| Next.js | 16.2.6 |
| React | 19 |
| Tailwind CSS | 4 |
| TypeScript | 6 |
| shadcn/ui | card, badge, button |
| Prettier | 3 |

---

## Getting Started

```bash
yarn        # install dependencies
yarn dev    # start dev server at http://localhost:3000
```

Other scripts:

```bash
yarn build          # production build
yarn lint           # ESLint
yarn format         # Prettier — write
yarn format:check   # Prettier — CI check
```

---

## How Feature Flags Work

Flags are defined in [`src/lib/featureFlags.ts`](src/lib/featureFlags.ts) as a plain object. Each flag is either a `boolean` or an array of rules.

```ts
export const FEATURE_FLAGS = {
  // Always on
  TEST_NEW_PRODUCTS_QUERY: true,

  // Always off
  DISABLED_FEATURE: false,

  // Role-based + percentage rollout
  MULTIPLE_ALLOWANCES: [
    { percentageOfUsers: 0.25, userRoles: ['user'] },  // 25% of regular users
    { userRoles: ['admin', 'tester'] },                 // all admins and testers
  ],
}
```

### Flag types

| Type | Example | Behaviour |
|---|---|---|
| `true` | `ADVANCED_ANALYTICS: true` | Enabled for everyone |
| `false` | `DISABLED_FEATURE: false` | Disabled for everyone |
| Rule array | `MULTIPLE_ALLOWANCES: [...]` | Evaluated per-user at request time |

### Rule evaluation

A rule can have two optional conditions — both must pass for the rule to match:

- **`userRoles`** — the user's role must be in the list (`admin`, `tester`, `user`)
- **`percentageOfUsers`** — a number between `0` and `1`; the user is bucketed deterministically using a MurmurHash3 of `"FLAG_NAME-userId"`

If a flag has multiple rules, the user only needs to match **one** (logical OR).

```ts
// src/lib/featureFlags.ts
export function canViewFeature(featureName: FeatureFlagName, user: User) {
  const rules = FEATURE_FLAGS[featureName]
  if (typeof rules === 'boolean') return rules
  return rules.some((rule) => checkRule(rule, featureName, user))
}
```

### Percentage bucketing

The hash of `"FEATURE_NAME-userId"` is divided by `MAX_UINT_32` to produce a stable float between 0 and 1. The same user always lands in the same bucket for a given flag, so they never flicker in and out.

```ts
murmurhash(`${featureName}-${userId}`) / MAX_UINT_32 < allowedPercent
```

The MurmurHash3 implementation lives in [`src/lib/murmurhash.ts`](src/lib/murmurhash.ts) — no npm package, just a single pure function.

---

## Using Flags in Components

Wrap any UI in `<FeatureEnabled>` — it renders its children only when the flag passes for the current user.

```tsx
import { FeatureEnabled } from '@/components/FeatureEnabled'

<FeatureEnabled featureFlag='ADVANCED_ANALYTICS'>
  <AnalyticsDashboard />
</FeatureEnabled>
```

`FeatureEnabled` is a **server component**. It calls `getUser()` and `canViewFeature()` synchronously at render time — no client-side JS, no layout shift.

```tsx
// src/components/FeatureEnabled.tsx
export function FeatureEnabled({ featureFlag, children }) {
  return canViewFeature(featureFlag, getUser()) ? children : null
}
```

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Demo page — one card per feature flag
│   ├── layout.tsx
│   └── globals.css       # Tailwind v4 theme + CSS variables
├── components/
│   ├── FeatureEnabled.tsx # Server component gate
│   └── ui/               # shadcn/ui — card, badge, button
├── lib/
│   ├── featureFlags.ts   # Flag definitions + evaluation logic
│   ├── getUser.ts        # Current user (swap with your auth layer)
│   ├── murmurhash.ts     # MurmurHash3 — percentage bucketing
│   └── utils.ts          # cn() helper
└── db/
    └── products.ts       # Example data layer
```

---

## Adding a New Flag

1. Add an entry to `FEATURE_FLAGS` in `src/lib/featureFlags.ts`:

```ts
MY_NEW_FEATURE: [{ userRoles: ['admin'] }],
```

2. Wrap the relevant UI:

```tsx
<FeatureEnabled featureFlag='MY_NEW_FEATURE'>
  <MyNewComponent />
</FeatureEnabled>
```

That's it. No config files, no environment variables, no dashboard.

---

## Swapping the User Source

`getUser()` in `src/lib/getUser.ts` currently returns a hardcoded user. Replace it with your auth provider:

```ts
// Example with next-auth
import { getServerSession } from 'next-auth'

export async function getUser() {
  const session = await getServerSession()
  return { id: session.user.id, role: session.user.role }
}
```



<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into the CaptionLint Next.js App Router application (`apps/web`).

## Summary of changes

- **`instrumentation-client.ts`** (new): Client-side PostHog initialization using the Next.js 15.3+ recommended approach. Replaces the `useEffect`-based init in `PostHogProvider`. Includes error tracking (`capture_exceptions: true`) and reverse-proxy routing (`api_host: "/ingest"`).
- **`apps/web/next.config.js`**: Added PostHog reverse proxy rewrites (`/ingest/*` → PostHog US) and `skipTrailingSlashRedirect: true`.
- **`apps/web/app/_components/posthog-provider.tsx`**: Removed `posthog.init()` call (now in `instrumentation-client.ts`). Kept `PHProvider` wrapper for React context hooks.
- **`apps/web/app/sign-in/sign-in-form.tsx`**: Added `posthog.identify()` + `user_signed_in` capture on successful email sign-in.
- **`apps/web/app/create-account/create-account-form.tsx`**: Added `posthog.identify()` + `user_signed_up` capture on successful account creation.
- **`apps/web/app/upload/upload-client.tsx`**: Added `lint_run_started`, `lint_run_completed`, `lint_run_failed`, `plan_limit_reached` captures with preset/format/run_mode properties. Added `captureException` on errors.
- **`apps/web/app/results/results-client.tsx`**: Added `caption_export_downloaded` capture with preset, format, and issue counts.
- **`apps/web/app/history/history-client.tsx`**: Added `history_run_downloaded` and `history_run_refixed` captures.
- **`apps/web/app/rulesets/rulesets-client.tsx`**: Added `vocabulary_term_added`, `vocabulary_term_removed`, and `plan_limit_reached` (vocabulary limit) captures.
- **`apps/web/.env.local`** (new): `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` set.
- **`turbo.json`**: Added `NODE_ENV` to build task env declarations.

## Events

| Event | Description | File |
|---|---|---|
| `user_signed_in` | User successfully signs in with email/password or OAuth provider | `apps/web/app/sign-in/sign-in-form.tsx` |
| `user_signed_up` | User successfully creates a new account via email or OAuth | `apps/web/app/create-account/create-account-form.tsx` |
| `lint_run_started` | User clicks Run QA to begin a caption lint run, with preset and file format | `apps/web/app/upload/upload-client.tsx` |
| `lint_run_completed` | Lint run completes successfully (local or API-backed), with preset and run mode | `apps/web/app/upload/upload-client.tsx` |
| `lint_run_failed` | Lint run fails due to a parse or API error | `apps/web/app/upload/upload-client.tsx` |
| `plan_limit_reached` | User attempts to run QA or add a vocabulary term but has hit the free plan limit | `apps/web/app/upload/upload-client.tsx`, `apps/web/app/rulesets/rulesets-client.tsx` |
| `caption_export_downloaded` | User downloads the fixed/exported caption file from the results page | `apps/web/app/results/results-client.tsx` |
| `history_run_downloaded` | User downloads a fixed file from the history table | `apps/web/app/history/history-client.tsx` |
| `history_run_refixed` | User re-runs a previous caption file with a potentially different preset | `apps/web/app/history/history-client.tsx` |
| `vocabulary_term_added` | User adds a new protected vocabulary term to the ruleset | `apps/web/app/rulesets/rulesets-client.tsx` |
| `vocabulary_term_removed` | User removes a protected vocabulary term from the ruleset | `apps/web/app/rulesets/rulesets-client.tsx` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics**: https://us.posthog.com/project/414405/dashboard/1557666
- **Signup & Sign-in Funnel**: https://us.posthog.com/project/414405/insights/waApLhLf
- **Lint Run Volume (Daily)**: https://us.posthog.com/project/414405/insights/YCW2JsiB
- **Export & History Downloads**: https://us.posthog.com/project/414405/insights/6atYcja4
- **Plan Limit Reached (Churn Risk)**: https://us.posthog.com/project/414405/insights/5tTSv1Aj
- **New Users (Signups & Sign-ins)**: https://us.posthog.com/project/414405/insights/n0QV9yYe

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>

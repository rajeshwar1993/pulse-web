# CLAUDE.md — pulse-web

## Overview

Next.js web app for Pulse — a daily check-in app. Rendered inside pulse-app's WebView (at `/appview/*` routes) and also serves standalone browser routes (at `/(browser)/*`).

## Architecture: Hybrid App

Flutter (pulse-app) acts as a thin native shell; all UI screens (auth, profile setup, dashboard) are rendered by this Next.js app inside a WebView.

**Communication:** Flutter ↔ WebView via `FlutterBridge` JavaScript channel. Messages use `{ type: string, payload: any }` JSON format. The `window.isReady` signal tells Flutter the dashboard has loaded so it can cross-fade from splash.

**Pulse Day:** Resets at 4 AM local time. Auto-pulse fires during splash screen on app launch.

**Data flow:** Both pulse-app and pulse-web connect to the same Supabase project. Auth sessions are shared via cookies injected by Flutter into the WebView.

**Database tables:** `profiles`, `daily_pulses`, `connections`, `invite_codes`, `missed_pulse_surveys` — all with RLS enforced via `auth.uid()`.

## Dashboard Architecture

Both `/appview/dashboard` (WebView) and `/(browser)/dashboard` (standalone web) render the same `DashboardContent` client component. Data flows as:

1. **Server page** (`page.tsx`) — fetches data from Supabase, computes derived state
2. **Client wrapper** (`page-client.tsx`, browser only) — adds interactivity (pulse button, toasts)
3. **Shared component** (`DashboardContent`) — renders the actual UI

When adding new data to the dashboard, update all three layers: both server pages, the browser client wrapper, and DashboardContent props.

## Build & Development

```bash
npm install
npm run dev              # Dev server on localhost:3000
npm run build            # Production build
npm run lint             # Biome linter
npm run format           # Biome formatter
npm test                 # Vitest (watch mode)
npm run test:ui          # Vitest UI
npm run test:coverage    # Coverage report
npx tsc --noEmit         # Type checking
```

## Key Conventions

- **Server Components** by default in `app/`; add `'use client'` only for interactivity
- Server Supabase client: `import { createClient } from '@/lib/supabase/server'` (async)
- Browser Supabase client: `import { supabase } from '@/lib/supabase/client'`
- File naming: kebab-case for components, Next.js conventions for pages
- Linting/formatting: Biome (not ESLint/Prettier)
- Tests co-located in `__tests__/` directories next to components
- `next-intl` for i18n; cookie `pulse-locale` for SSR locale resolution
- `cookies()` is async in Next.js 16: `const cookieStore = await cookies()`

## Environment Variables

`.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

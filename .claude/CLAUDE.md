# pulse-web Technical Reference

Next.js web application providing dashboard screens rendered in pulse-app's WebView.

## Project Type & Technology Stack

**Framework**: Next.js 16.1.6 (App Router)
**React**: 19.2.3
**Language**: TypeScript 5
**Backend**: Supabase (@supabase/ssr ^0.8.0, @supabase/supabase-js ^2.95.3)
**Styling**: Tailwind CSS v4, @tailwindcss/postcss ^4
**Animation**: framer-motion ^12.34.0
**Utilities**: date-fns ^4.1.0, qrcode.react ^4.2.0
**Linting**: Biome 2.2.0
**Testing**: Vitest ^4.0.18, @testing-library/react ^16.3.2, jsdom ^28.0.0
**Compiler**: babel-plugin-react-compiler 1.0.0

## Project Structure

```
src/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx            # Root layout (metadata, fonts)
│   ├── page.tsx              # Landing/auth page
│   ├── dashboard/            # Dashboard screens (Server Component)
│   ├── profile-setup/        # Profile setup flow
│   ├── connections/          # Connection management
│   └── auth/
│       └── error/            # Auth error handling
├── components/
│   ├── dashboard/            # Dashboard-specific components
│   ├── connections/          # Connection management components
│   └── ui/                   # Shared UI components
├── lib/
│   ├── supabase/
│   │   ├── client.ts         # Client-side Supabase client
│   │   └── server.ts         # Server-side Supabase client
│   └── services/             # Business logic services
├── proxy.ts                  # Middleware for session handling
└── styles/                   # Global CSS, Tailwind config
```

## Critical Files

**App Entry Points**
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/app/layout.tsx` - Root layout, global metadata
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/app/page.tsx` - Landing page (redirects to auth/dashboard)

**Core Pages**
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/app/dashboard/page.tsx` - Main dashboard (Server Component, fetches pulse status & connections)
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/app/profile-setup/page.tsx` - Profile setup flow
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/app/connections/page.tsx` - Connection management screen

**Supabase Clients**
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/lib/supabase/client.ts` - Browser client (reads from cookies)
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/lib/supabase/server.ts` - Server client (SSR, cookies via next/headers)

**Middleware**
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/proxy.ts` - Session refresh middleware (runs on all requests)

**Services**
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/lib/services/connection-service.ts` - Connection CRUD operations

**Dashboard Components**
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/components/dashboard/dashboard-content.tsx` - Main dashboard UI
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/components/dashboard/status-card.tsx` - User pulse status card
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/components/dashboard/connection-grid.tsx` - Grid of connections
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/components/dashboard/connection-card.tsx` - Individual connection card
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/components/dashboard/wisdom-card.tsx` - Daily wisdom display

**Connection Components**
- `/Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web/src/components/connections/invite-modal.tsx` - QR code & invite link modal

## Development Setup

**Prerequisites**
- Node.js 20+
- npm or pnpm

**Installation**
```bash
cd /Users/rajeshwarrudra/Documents/DevWork/Pulse-workspace/pulse-web
npm install
```

**Environment Configuration**
Create `.env.local` in project root:
```
NEXT_PUBLIC_SUPABASE_URL=<your_supabase_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_supabase_anon_key>
```

**Run Development Server**
```bash
npm run dev
# Opens on http://localhost:3000
```

## Coding Patterns & Conventions

**Server vs Client Components**
- **Default**: All components in `app/` are Server Components
- **Use Server Components for**: Data fetching, direct DB access, SEO, initial render
- **Use Client Components for**: Interactivity, hooks (useState, useEffect), browser APIs
- Mark Client Components with `'use client'` directive at top of file

**Server Component Pattern (Dashboard Example)**
```typescript
// app/dashboard/page.tsx - Server Component (no 'use client')
export default async function Dashboard() {
  const supabase = await createClient(); // Server client
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch data directly in component
  const { data: profile } = await supabase
    .from('profiles')
    .select()
    .eq('id', user.id)
    .single();

  return <DashboardContent profile={profile} />;
}
```

**Client Component Pattern**
```typescript
// components/dashboard/connection-card.tsx
'use client'; // Required for interactivity

import { useState } from 'react';

export function ConnectionCard({ connection }: { connection: Connection }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div onMouseEnter={() => setIsHovered(true)}>
      {/* Interactive UI */}
    </div>
  );
}
```

**Supabase Client Usage**
```typescript
// Server Component (pages, layouts)
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// Client Component
import { supabase } from '@/lib/supabase/client';
// Use directly (no await needed for import)
```

**TypeScript Patterns**
- Define types inline or in separate `.d.ts` files
- Use `interface` for object shapes, `type` for unions/intersections
- Export types from component files for reuse
- Use strict null checks (user?, profile || null)

**File Naming**
- Components: kebab-case (connection-card.tsx)
- Pages: Next.js conventions (page.tsx, layout.tsx, error.tsx)
- Types: PascalCase (Connection, Profile)

## State Management

**Approach**: React 19 built-in + Server Components (no external state library)

**State Patterns**
- **Server State**: Fetched in Server Components, passed as props
- **Client State**: `useState` in Client Components for UI state
- **Form State**: React 19 form actions, `useFormStatus`
- **URL State**: Next.js searchParams for filters, pagination

**Data Fetching**
- Server Components: Direct `await supabase.from()...` queries
- Client Components: Use Supabase realtime subscriptions or fetch in useEffect
- No need for SWR/React Query (Server Components handle caching)

**Passing Data from Server to Client**
```typescript
// Server Component fetches data
export default async function Page() {
  const data = await fetchData();
  return <ClientComponent data={data} />; // Pass as props
}

// Client Component receives data
'use client';
export function ClientComponent({ data }: { data: Data }) {
  // Use data for client-side interactivity
}
```

## Testing Approach

**Test Framework**: Vitest 4.0.18
**React Testing**: @testing-library/react ^16.3.2
**DOM Environment**: jsdom ^28.0.0

**Test Location**: Co-located with components in `__tests__/` directories
```
components/dashboard/
├── connection-card.tsx
└── __tests__/
    └── connection-card.test.tsx
```

**Running Tests**
```bash
npm test                 # Run all tests (watch mode)
npm run test:ui          # Run with Vitest UI
npm run test:coverage    # Run with coverage report
```

**Test Pattern**
```typescript
import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { ConnectionCard } from '../connection-card';

test('renders connection name', () => {
  const mockConnection = {
    id: '1',
    name: 'Mom',
    status: 'active' as const,
    pulseTime: new Date(),
  };

  render(<ConnectionCard connection={mockConnection} />);

  expect(screen.getByText('Mom')).toBeInTheDocument();
});
```

**Mocking Supabase**
```typescript
import { vi } from 'vitest';

vi.mock('@/lib/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({ data: mockData })),
        })),
      })),
    })),
  },
}));
```

## Build & Development Commands

**Development**
```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
```

**Code Quality**
```bash
npm run lint             # Run Biome linter
npm run format           # Format code with Biome
```

**Testing**
```bash
npm test                 # Run tests in watch mode
npm run test:ui          # Open Vitest UI
npm run test:coverage    # Generate coverage report
```

**Type Checking**
```bash
npx tsc --noEmit         # TypeScript type checking (no Biome equivalent)
```

## Integration Points

**pulse-web → pulse-supabase**
- SSR Client: `createClient()` from `@/lib/supabase/server` (uses cookies)
- Browser Client: `supabase` from `@/lib/supabase/client` (reads cookies set by Flutter)
- Middleware: `proxy.ts` refreshes session on all requests
- Tables: `profiles`, `daily_pulses`, `connections`, `invite_codes`

**pulse-web ← pulse-app (WebView Bridge)**
- Loaded in pulse-app's WebView at `/dashboard` or other routes
- Receives session cookies from Flutter (injected via webview_flutter)
- JavaScript Bridge: `window.FlutterBridge.postMessage({ type, payload })`
- Example: `window.FlutterBridge?.postMessage({ type: 'NAVIGATE', payload: '/connections' })`
- Bridge checks: `if (typeof window !== 'undefined' && window.FlutterBridge)`

**Environment Variables**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- Prefix `NEXT_PUBLIC_` for client-side access

## Common Code Patterns

**Server Component Data Fetching**
```typescript
// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Dashboard() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select()
    .eq('id', user.id)
    .single();

  if (!profile) redirect('/profile-setup');

  return <DashboardContent profile={profile} />;
}
```

**Client Component with Interactivity**
```typescript
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function ConnectionCard({ connection }: Props) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={() => setShowDetails(!showDetails)}
    >
      {/* Card content */}
    </motion.div>
  );
}
```

**Tailwind Styling Pattern**
```typescript
// Use Tailwind classes with custom CSS variables
<div className="bg-[var(--off-white)] text-[var(--dark-gray)]">
  <h1 className="text-2xl font-bold mb-4">Title</h1>
</div>

// Custom properties defined in globals.css:
// --pulse-purple: #8B5CF6
// --off-white: #FAF9F6
// --soft-gray: #E5E5E5
```

**Type Definition**
```typescript
// Define in same file or separate .d.ts
export interface Connection {
  id: string;
  avatar: string;
  name: string;
  status: 'active' | 'waiting';
  pulseTime: Date | null;
}

// Use in components
export function ConnectionGrid({ connections }: { connections: Connection[] }) {
  return <div>{/* ... */}</div>;
}
```

**Form Action Pattern (React 19)**
```typescript
'use client';

import { useFormStatus } from 'react-dom';

export function ProfileForm() {
  async function handleSubmit(formData: FormData) {
    const name = formData.get('name') as string;
    // Submit to server action or API
  }

  return (
    <form action={handleSubmit}>
      <input name="name" required />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Submit</button>;
}
```

**Conditional FlutterBridge Call**
```typescript
'use client';

export function NavigateButton() {
  const handleNavigate = () => {
    // Check if running in WebView
    if (typeof window !== 'undefined' && window.FlutterBridge) {
      window.FlutterBridge.postMessage({
        type: 'NAVIGATE',
        payload: '/connections',
      });
    } else {
      // Fallback for web browser
      window.location.href = '/connections';
    }
  };

  return <button onClick={handleNavigate}>Go to Connections</button>;
}
```

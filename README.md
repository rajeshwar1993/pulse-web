# Pulse Web (Next.js Dashboard)

The Pulse web dashboard - a Next.js application that runs inside the Flutter WebView. This provides the UI/UX for the Pulse app after authentication.

## Architecture

**WebView-First Design**

This Next.js app is designed to be loaded inside a Flutter WebView, not as a standalone web app. All UI rendering happens in the WebView while the Flutter shell handles authentication and backend communication.

```
┌──────────────────────────────────────────┐
│      NEXT.JS SPA (WebView Content)       │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Dashboard Page                    │ │
│  │  - WisdomCard (auto-fade)         │ │
│  │  - StatusCard (Active/Inactive)   │ │
│  │  - ConnectionGrid                 │ │
│  │  - EmptyConnectionsView           │ │
│  └────────────────────────────────────┘ │
│              ↓                           │
│       Supabase Client                    │
│       (Auth, Queries)                    │
│              ↓                           │
│    window.FlutterBridge.postMessage()   │
│    (Signal ready to Flutter)            │
└──────────────────────────────────────────┘
```

---

## Core Features

### 1. **Wisdom System**
Location: `src/lib/data/wisdom-library.ts`, `src/lib/services/wisdom-service.ts`

A collection of 60+ motivational phrases shown to users after they complete their pulse.

#### Wisdom Service API:

```typescript
// Get a random wisdom phrase (no consecutive repeats)
const wisdom = getRandomWisdom();

// Get multiple random wisdoms
const wisdoms = getMultipleWisdom(5);

// Clear last shown wisdom (for testing)
clearLastWisdom();
```

#### Smart Features:
- **No Repeats**: Uses sessionStorage to prevent consecutive duplicates
- **60+ Phrases**: Organized into 6 categories (connection, relationships, reinforcement, etc.)
- **Type-Safe**: Full TypeScript support with const assertions

### 2. **Dashboard Components**

#### **WisdomCard** (`src/components/dashboard/wisdom-card.tsx`)
Displays random motivational wisdom after user pulses.

**Features:**
- Auto-fade after 3 seconds (configurable)
- Dismissible via click/tap
- Keyboard accessible (Enter/Space to dismiss)
- Glassmorph styling (backdrop blur)
- Smooth fade-in/fade-out animations

**Usage:**
```tsx
<WisdomCard
  autoDismiss={true}
  dismissDelay={3000}
  onDismiss={() => console.log('Dismissed')}
/>
```

#### **StatusCard** (`src/components/dashboard/status-card.tsx`)
Shows user's pulse status for the current day.

**States:**
- **Active**: Green indicator, pulse animation, formatted time
- **Inactive**: Grey indicator, "not pulsed yet" message

**Usage:**
```tsx
<StatusCard
  isActive={true}
  pulseTime={new Date('2025-01-15T08:30:00')}
/>
```

#### **ConnectionCard** (`src/components/dashboard/connection-card.tsx`)
Displays individual connection with their pulse status.

**Variants:**
- **Active**: Full opacity, colored ring, pulse animation, shows time
- **Waiting**: Reduced opacity (70%), desaturated, "Waiting..." text

**Usage:**
```tsx
<ConnectionCard
  avatar="https://example.com/avatar.jpg"
  name="Mom"
  status="active"
  pulseTime={new Date()}
/>
```

#### **ConnectionGrid** (`src/components/dashboard/connection-grid.tsx`)
Responsive grid layout for connections.

**Layout:**
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

**Usage:**
```tsx
<ConnectionGrid connections={[
  { id: '1', avatar: '...', name: 'Mom', status: 'active', pulseTime: new Date() },
  { id: '2', avatar: '...', name: 'Dad', status: 'waiting', pulseTime: null },
]} />
```

#### **EmptyConnectionsView** (`src/components/dashboard/empty-connections-view.tsx`)
Friendly empty state when no connections exist.

**Features:**
- Icon/illustration
- "Invite someone" button (disabled, placeholder for Unit 3)
- "Coming soon" notice

**Usage:**
```tsx
<EmptyConnectionsView />
```

#### **DashboardContent** (`src/components/dashboard/dashboard-content.tsx`)
Client component wrapper that orchestrates all dashboard components.

**Features:**
- **window.isReady signal**: Sends JSON message to Flutter via `FlutterBridge`
- **Dynamic greeting**: "Good morning/afternoon/evening" based on time
- Manages WisdomCard visibility state

---

## Project Structure

```
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx                   # Main dashboard page (Server Component)
│   ├── auth/                          # Auth pages
│   ├── profile-setup/                 # Profile setup
│   └── globals.css                    # Global styles + CSS variables
├── components/
│   ├── dashboard/
│   │   ├── wisdom-card.tsx            # Wisdom display component
│   │   ├── status-card.tsx            # User status component
│   │   ├── connection-card.tsx        # Individual connection component
│   │   ├── connection-grid.tsx        # Connection list/grid
│   │   ├── empty-connections-view.tsx # Empty state component
│   │   ├── dashboard-content.tsx      # Client wrapper (window.isReady)
│   │   ├── index.ts                   # Barrel export
│   │   └── __tests__/                 # Component tests
│   └── ui/
│       └── pulse-logo.tsx             # Logo component
├── lib/
│   ├── data/
│   │   └── wisdom-library.ts          # 60+ wisdom phrases
│   ├── services/
│   │   ├── wisdom-service.ts          # Wisdom selection logic
│   │   └── __tests__/                 # Service tests
│   └── supabase/
│       ├── client.ts                  # Client-side Supabase
│       └── server.ts                  # Server-side Supabase
└── styles/                            # Additional styles

test/ (via Vitest)
└── All test files colocated with source in __tests__ directories
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm / bun
- Supabase project configured

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser or Flutter WebView:**
   - Browser: [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
   - WebView: Configure Flutter app to load this URL

---

## Development Workflow

### Running the Dashboard

**Standalone (Browser):**
```bash
npm run dev
```
Visit [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

**In Flutter WebView:**
1. Start Next.js dev server: `npm run dev`
2. Run Flutter app: `cd ../pulse-app && flutter run`
3. Flutter loads `http://localhost:3000/dashboard` in WebView

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm test:ui

# Run tests with coverage
npm test:coverage
```

**Test Results:** 59 tests across 5 test files
- Wisdom service: 10 tests
- WisdomCard: 10 tests
- StatusCard: 12 tests
- ConnectionCard: 17 tests
- EmptyConnectionsView: 10 tests

### Mock Data

Enable mock connections for testing:

```
http://localhost:3000/dashboard?mock=true
```

This displays 3 test connections (Mom - active, Dad - active, Sarah - waiting).

---

## Flutter ↔ WebView Communication

### window.isReady Signal Protocol

When the Dashboard finishes loading, it sends a ready signal to Flutter:

**Next.js → Flutter:**
```typescript
// In DashboardContent component
useEffect(() => {
  if (typeof window !== 'undefined' && window.FlutterBridge) {
    window.FlutterBridge.postMessage(JSON.stringify({
      type: 'ready',
      timestamp: Date.now(),
    }));
  }
}, []);
```

**Flutter receives:**
```dart
..addJavaScriptChannel(
  'FlutterBridge',
  onMessageReceived: (JavaScriptMessage message) {
    // Parse JSON and handle 'ready' signal
    final data = jsonDecode(message.message);
    if (data['type'] == 'ready') {
      // Dashboard is ready, trigger cross-fade
    }
  },
)
```

**Message Format:**
```json
{
  "type": "ready",
  "timestamp": 1704067200000
}
```

---

## Styling

### Design System

**Color Palette** (defined in `globals.css`):
```css
--teal: #62B1AD        /* Primary brand color */
--green: #10B981       /* Success/Active indicator */
--blue: #3B82F6        /* Info/Links */
--off-white: #F8FAFC   /* Background */
--slate-900: #0F172A   /* Primary text */
```

**Typography:**
- Font Family: Inter (variable font)
- Secondary: Instrument Sans

**Components:**
- Glassmorph cards: `bg-white/80 backdrop-blur-md`
- Shadows: `shadow-lg shadow-[var(--teal)]/10`
- Borders: `border border-[var(--teal)]/20`

---

## Data Fetching

### Dashboard Page (Server Component)

The Dashboard page fetches data server-side:

```typescript
// Check authentication
const { data: { user } } = await supabase.auth.getUser();
if (!user) redirect('/');

// Fetch user profile
const { data: profile } = await supabase
  .from('profiles')
  .select()
  .eq('id', user.id)
  .single();

// Check if user pulsed today
const pulseDayStart = getStartOfPulseDay(); // 4 AM logic
const { data: todayPulse } = await supabase
  .from('daily_pulses')
  .select('created_at')
  .eq('user_id', user.id)
  .gte('created_at', pulseDayStart.toISOString())
  .maybeSingle();

const isActive = todayPulse !== null;
```

### Pulse Day Logic (4 AM Reset)

```typescript
function getStartOfPulseDay(): Date {
  const now = new Date();
  const today4AM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    4, 0, 0
  );

  if (now < today4AM) {
    // Before 4 AM: Pulse Day started yesterday
    return new Date(today4AM.getTime() - 24 * 60 * 60 * 1000);
  } else {
    // After 4 AM: Pulse Day started today
    return today4AM;
  }
}
```

---

## Build & Deployment

### Production Build

```bash
npm run build
npm run start
```

### Environment Variables (Production)

```
NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
```

---

## Troubleshooting

### FlutterBridge not available
- **Cause**: Running in browser (not WebView)
- **Solution**: Check for `window.FlutterBridge` existence before calling
- **Expected**: Console warning in browser, works fine in Flutter WebView

### Wisdom repeating consecutively
- **Cause**: sessionStorage not persisting
- **Solution**: Check browser/WebView storage permissions
- **Fallback**: Service has max attempts to prevent infinite loops

### Tests failing
- **Cause**: Missing dependencies or setup
- **Solution**: Run `npm install` and verify `vitest.config.ts` exists

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Testing**: Vitest + React Testing Library
- **Backend**: Supabase (Auth + PostgreSQL)
- **Date Handling**: date-fns
- **Animations**: Framer Motion
- **Linting**: Biome

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)

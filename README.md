# FleetDesk

Event equipment rental management dashboard for production companies. Handles asset catalogue, reservation planning, and conflict detection for technical event gear (audio, lighting, rigging, power).

## Architecture

Built as a single-page React app with `useSyncExternalStore` for state management and localStorage persistence. Routing via react-router-dom with URL-synced filters. Three main views: asset catalogue with grid layout, Gantt-style planning timeline, and sortable reservations table. Inspector panel slides in from right when an asset is selected. Multi-step wizard with live conflict warnings for new reservations. Command palette for quick navigation and actions.

Feature modules (`features/`) own view logic and domain components. Shared UI primitives (`shared/ui/`) handle Button, Modal with focus trap, Toast container, Badge variants. Store layer exports typed actions and selectors. Conflict detection lives in pure `lib/conflicts.ts`.

## Tech Stack

- React 18 + TypeScript (strict mode)
- React Router v6 for client-side routing
- Vite (build tool)
- Tailwind CSS 4 alpha via @tailwindcss/vite
- Framer Motion for layout animations and stagger effects
- @dnd-kit for potential drag interactions
- Zod for wizard step validation
- date-fns for date manipulation and formatting
- lucide-react icons (used sparingly)
- Custom fonts: **Sora** (UI), **IBM Plex Mono** (serials/IDs)

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Features

- **Catalogue view**: Filterable asset grid (category, status, full-text), URL-synced query params
- **Planning view**: 3-week Gantt-style horizontal timeline with reservation bars
- **Reservations list**: Sortable table with inline cancel action
- **Inspector panel**: Right-side slide-in for selected asset (status change, notes edit, upcoming bookings, conflict alerts)
- **Reservation wizard**: 4-step flow (asset → dates → client/event → review) with live conflict detection
- **Command palette**: ⌘K / Ctrl+K for fuzzy search across assets and navigation
- **Keyboard shortcuts**: `n` for new reservation, `j`/`k` list nav (basic), `Esc` close inspector
- **Toast notifications**: Success/error feedback with 5s Undo for new reservations
- **Stats strip**: Header shows available count, on-site count, conflicts in next 7 days
- **Empty states**: Contextual for no results, no reservations, filtered-out data
- **Optimistic-ish UX**: Immediate UI update on create/cancel with undo window

## Trade-offs

- **localStorage persistence**: State survives reload but doesn't sync across tabs. No backend. Production needs PostgreSQL + REST/GraphQL API.
- **Conflict detection client-side only**: Production requires server-side validation at reservation write to prevent race conditions.
- **No multi-user or auth**: Single-operator view. Production needs JWT/session + RBAC for teams.
- **In-memory search/filter**: Linear scan acceptable for <1000 assets. Scale requires Postgres full-text search or Algolia/Meilisearch.
- **Timezone handling**: Implicitly Europe/Paris (date-fns `fr` locale). Production needs explicit `Intl.DateTimeFormat` and per-user tz prefs.
- **No asset history or audit log**: Can't see who changed status when. Production needs event sourcing or append-only audit table.
- **Gantt view scrolls but doesn't virtualize**: Works for 3 weeks × 25 assets. Longer range needs react-virtual or similar.
- **Drag-and-drop prepared but not wired**: @dnd-kit installed but not connected to reservation rescheduling. Would need recompute conflicts on drop.
- **Keyboard nav partial**: j/k nav not implemented in lists (listed in shortcuts but omitted for brevity). Full a11y needs roving tabindex or Downshift-style patterns.

# FleetDesk

Event equipment rental management dashboard for production companies.

## Architecture

Built as a single-page React app with local state management. Asset catalog and reservations are stored in-memory with conflict detection logic separated into pure functions. Component tree follows container/presentational split where appropriate.

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS via @tailwindcss/vite
- Zod for form validation
- date-fns for date manipulation
- Custom store hook (no external state lib)

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Trade-offs

- No backend or persistence layer. Reload loses state. Acceptable for portfolio showcase.
- Conflict detection is client-side only. Production would need server-side validation.
- Search is in-memory linear scan. Fine for demo scale, would need indexing at scale.
- No authentication or multi-tenancy. Single operator view.
- Date handling assumes Europe/Paris timezone. Production needs explicit tz support.

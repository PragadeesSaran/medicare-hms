# MediCare HMS Workspace

## Overview

Full-stack Hospital Management System (MediCare HMS) built as a portfolio/resume project. Features a professional landing page, JWT authentication, and complete hospital management modules.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Auth**: JWT tokens (bcryptjs for hashing, jsonwebtoken for signing)
- **Routing**: Wouter

## Application Structure

### Artifact: MediCare HMS (`artifacts/medicare-hms`)
- Preview path: `/` (root)
- React + Vite frontend with full hospital management UI
- Auth context in `src/lib/auth.tsx`
- JWT stored in localStorage under `medicare_token`

### Artifact: API Server (`artifacts/api-server`)
- Preview path: `/api`
- Express 5 REST API
- Routes: auth, departments, patients, doctors, appointments, prescriptions, bills, dashboard

### Database Schema (`lib/db/src/schema/`)
- `users` — auth accounts (admin, doctor, patient, receptionist roles)
- `departments` — hospital departments
- `patients` — patient records
- `doctors` — doctor profiles linked to departments
- `appointments` — appointment bookings with status (scheduled/completed/cancelled)
- `prescriptions` — medical prescriptions
- `bills` — billing records with payment status

## Demo Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Doctor | doctor1 | doctor123 |
| Patient | patient1 | patient123 |
| Receptionist | receptionist1 | rec123 |

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Pages

1. `/` — Landing page (public)
2. `/login` — Login page (public)
3. `/dashboard` — Main dashboard with stats and charts
4. `/patients` — Patient management (CRUD)
5. `/doctors` — Doctor management with profile cards
6. `/appointments` — Appointment booking and management
7. `/prescriptions` — Prescription management
8. `/billing` — Billing and payment management
9. `/profile` — User profile

## Role-Based Access

- **Admin**: Full access to everything
- **Doctor**: View patients, manage own appointments, issue prescriptions
- **Patient**: View own appointments, prescriptions, bills
- **Receptionist**: Manage patients, book appointments, generate bills

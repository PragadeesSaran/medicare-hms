# MediCare HMS — Hospital Management System

A complete, production-ready Hospital Management System built with React, Node.js, and PostgreSQL. Designed as a full-stack portfolio project demonstrating enterprise-level architecture, role-based access control, and a professional medical-grade UI.

---

## Live Demo

> Add your deployed URL here once published

**Demo Credentials:**

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Doctor | `doctor1` | `doctor123` |
| Patient | `patient1` | `patient123` |
| Receptionist | `receptionist1` | `rec123` |

---

## Features

- **JWT Authentication** with role-based access control (Admin, Doctor, Patient, Receptionist)
- **Dashboard** with real-time statistics, appointment charts, and revenue tracking
- **Patient Management** — full CRUD with search, pagination, appointment history
- **Doctor Management** — profile cards, department filtering, availability toggling, slot booking
- **Appointment System** — multi-step booking flow, status management (Scheduled / Completed / Cancelled)
- **Prescription Management** — issue and view prescriptions (Doctor role)
- **Billing System** — generate bills, track payments, revenue analytics
- **Responsive Design** — mobile-friendly sidebar that collapses to a hamburger menu
- **Professional UI** — dark navy sidebar, teal accents, animated charts

---

## Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | UI library |
| TypeScript | Type safety |
| Tailwind CSS | Styling |
| shadcn/ui | Component library |
| Recharts | Dashboard charts |
| React Hook Form + Zod | Form validation |
| Wouter | Client-side routing |
| TanStack Query | Server state management |
| Framer Motion | Animations |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express 5 | REST API server |
| TypeScript | Type safety |
| PostgreSQL | Primary database |
| Drizzle ORM | Database queries & migrations |
| JWT (jsonwebtoken) | Authentication |
| bcryptjs | Password hashing |
| Zod | Request/response validation |
| Pino | Structured logging |

### Architecture
| Pattern | Details |
|---------|---------|
| Monorepo | pnpm workspaces |
| API-first | OpenAPI spec → code generation |
| Contract-first | Orval generates React Query hooks from OpenAPI |

---

## Project Structure

```
├── artifacts/
│   ├── api-server/        # Express REST API
│   │   └── src/routes/    # auth, patients, doctors, appointments, prescriptions, bills, dashboard
│   └── medicare-hms/      # React frontend
│       └── src/
│           ├── pages/     # Landing, Login, Dashboard, Patients, Doctors, Appointments, Prescriptions, Billing, Profile
│           ├── components/ # Shared UI components
│           └── lib/       # Auth context, utilities
├── lib/
│   ├── api-spec/          # OpenAPI specification (single source of truth)
│   ├── api-client-react/  # Generated React Query hooks
│   ├── api-zod/           # Generated Zod validation schemas
│   └── db/                # Drizzle ORM schema & database client
```

---

## Database Schema

```
users          — accounts (username, password, role, email)
departments    — hospital departments (Cardiology, Neurology, etc.)
patients       — patient records (DOB, blood group, contact info)
doctors        — doctor profiles linked to departments
appointments   — bookings (date, time slot, status)
prescriptions  — diagnosis, medicines, dosage instructions
bills          — consultation fees, medicine costs, payment status
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/register` | Register new user |
| GET | `/api/auth/me` | Get current user |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Total patients, doctors, revenue |
| GET | `/api/dashboard/chart-data` | Last 7 days chart data |
| GET | `/api/dashboard/recent-appointments` | Latest 5 appointments |

### Patients
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/patients` | List with search & pagination |
| POST | `/api/patients` | Create patient |
| GET | `/api/patients/:id` | Get patient detail |
| PUT | `/api/patients/:id` | Update patient |
| GET | `/api/patients/:id/history` | Appointment history |

### Doctors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/doctors` | List all (filterable by department) |
| POST | `/api/doctors` | Create doctor |
| GET | `/api/doctors/:id/slots?date=YYYY-MM-DD` | Available time slots |
| PUT | `/api/doctors/:id/availability` | Toggle availability |
| GET | `/api/doctors/:id/appointments` | Doctor's appointments |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/appointments` | List with date/status filter |
| POST | `/api/appointments` | Book appointment |
| PUT | `/api/appointments/:id/cancel` | Cancel |
| PUT | `/api/appointments/:id/complete` | Mark complete |

### Prescriptions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/prescriptions` | List all |
| POST | `/api/prescriptions` | Issue prescription |
| GET | `/api/prescriptions/:id` | Get detail |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bills` | List all bills |
| POST | `/api/bills` | Generate bill |
| PUT | `/api/bills/:id/pay` | Mark as paid |
| GET | `/api/bills/stats` | Revenue summary |

---

## Role-Based Access

| Feature | Admin | Doctor | Patient | Receptionist |
|---------|-------|--------|---------|--------------|
| Dashboard | Full | Limited | Own data | Limited |
| Patients | Full CRUD | View only | Own record | Full CRUD |
| Doctors | Full CRUD | View | View | View |
| Appointments | Full | Own only | Own only | Full |
| Prescriptions | View all | Issue + View | Own only | View |
| Billing | Full | View | Own only | Full |

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- pnpm 8+
- PostgreSQL database

### Environment Variables

Create a `.env` file (or set these in your hosting environment):

```env
DATABASE_URL=postgresql://user:password@host:5432/medicare_hms
SESSION_SECRET=your-strong-jwt-secret-key
PORT=8080
```

### Install & Run

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm --filter @workspace/db run push

# Run the API server
pnpm --filter @workspace/api-server run dev

# Run the frontend (in a new terminal)
pnpm --filter @workspace/medicare-hms run dev
```

### Code Generation (after API spec changes)

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Screenshots

> Add screenshots here after deployment

---

## License

MIT

# Dental MS

Multi-branch Dental Management System with offline support — React (Vite + Chakra UI) frontend and NestJS API.

---

## Prerequisites

- **Node.js** 20+
- **pnpm** — `npm install -g pnpm`
- **Docker & Docker Compose** — for PostgreSQL, Redis, and MinIO

---

## Quick start

### 1. Install dependencies

From the project root:

```bash
pnpm install
```

### 2. Start infrastructure (PostgreSQL, Redis, MinIO)

```bash
docker-compose up -d
```

Check that containers are running:

```bash
docker-compose ps
```

### 3. Environment files

**API** — copy the example env and keep defaults for local dev:

```bash
cp apps/api/.env.example apps/api/.env
```

**Web** — copy the example env for the frontend:

```bash
cp apps/web/.env.example apps/web/.env.local
```

You can leave the values as in the examples; they point to the seeded dev branch and local API/Socket URLs.

### 4. Run the app

**Option A — Run API and web together (from root):**

```bash
pnpm dev
```

- API: http://localhost:3000  
- Web: http://localhost:5173  

**Option B — Run in separate terminals:**

Terminal 1 — API:

```bash
pnpm api
```

Terminal 2 — Web:

```bash
pnpm web
```

### 5. Open the app

- Open **http://localhost:5173** in your browser.
- Use **Patients** to add patients and **Appointments** for the calendar (create appointments, change status; real-time updates via Socket.IO).

---

## Commands (from project root)

| Command        | Description                          |
|----------------|--------------------------------------|
| `pnpm install` | Install all workspace dependencies   |
| `pnpm dev`     | Run API + web in parallel            |
| `pnpm api`     | Run NestJS API only (port 3000)     |
| `pnpm web`     | Run Vite frontend only (port 5173)   |
| `pnpm build`   | Build all apps and packages         |

---

## Infrastructure (Docker)

| Service   | Port(s)  | Purpose                    |
|----------|----------|----------------------------|
| PostgreSQL | 5432   | Main database              |
| Redis    | 6379     | Cache / queues (future)    |
| MinIO    | 9000, 9001 | S3-compatible storage (e.g. imaging) |

- **Database**: `postgresql://user:pass@localhost:5432/dentalms`
- **MinIO console**: http://localhost:9001 (minioadmin / minioadmin)

On first API start (non-production), the API seeds a **dev branch** and a **dev doctor** so you can create patients and appointments without extra setup.

---

## Troubleshooting

- **"Branch context required"** — Ensure `apps/web/.env.local` has `VITE_BRANCH_ID=00000000-0000-0000-0000-000000000001` (same as seeded branch).
- **API won’t start** — Ensure Docker is running and `docker-compose up -d` has been run so PostgreSQL is available.
- **Port in use** — Change `PORT` in `apps/api/.env` or the Vite port in `apps/web/vite.config.ts` if 3000 or 5173 are taken.

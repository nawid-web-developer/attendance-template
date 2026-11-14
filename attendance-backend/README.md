# Attendance Backend

Standalone Express.js API with a MySQL database. It is independent from the Next.js project in `attendance-frontend` and can serve a web app, mobile app, kiosk, or another client.

## Install and run

Requirements: Node.js 20+, npm, and Docker Desktop (or a local MySQL 8 server).

```bash
cp .env.example .env
./install.sh
docker compose up -d
npm run dev
```

The API runs at `http://localhost:4000`.

## API routes

- `GET /api/health`
- `GET /api/workspaces`
- `GET /api/dashboard?workspaceId=1`
- `GET /api/people?workspaceId=1`
- `GET /api/attendance/recent?workspaceId=1`
- `POST /api/attendance/check-in`
- `POST /api/attendance/sync`
- `GET /api/settings/work-time?workspaceId=1`
- `PUT /api/settings/work-time`
- `GET /api/reports/attendance.xlsx?workspaceId=1&from=2026-01-01&to=2026-01-31`
- `GET /api/reports/attendance.pdf?workspaceId=1&from=2026-01-01&to=2026-01-31`

The SQL schema supports schools, universities, companies, and training organizations through a reusable workspace and people model. Each attendance record stores the originating device ID for auditing. A scan with `action=in` calculates late minutes against the editable schedule; a scan with `action=out` calculates early-leave minutes. Both are converted to a deduction using the employee hourly rate. Add authentication, role permissions, rate limiting, and privacy controls before production use.

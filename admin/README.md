# Kompete Admin Panel

Full-stack admin console for Kompete — view users, see company analysis history, and perform admin actions.

```
admin/
├── backend/   FastAPI (port 8001) — imports from ../backend for DB + config
└── frontend/  React + Vite (port 5173)
```

## Quick start

### 1. Backend

```bash
# Activate the main backend venv
cd backend && source venv/bin/activate

# Run the admin API
cd ../admin/backend
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

### 2. Frontend

```bash
cd admin/frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 3. Login

Open http://localhost:5173 and enter the `ADMIN_SECRET` value from `backend/.env`.

## Features

| Page | What you can do |
|------|----------------|
| **Dashboard** | Platform stats, analysis activity chart, top companies, recent reports |
| **Users** | Search/filter all users; click any row to open a detail panel with their full report history |
| **Reports** | Every analysis ever run — sortable by company or date, with per-company frequency bars |

## Admin actions (from Users → detail panel)

- **Reset Report Limit** — deletes all reports for the user, restoring their free-tier slot
- **Delete User Data** — permanently removes reports, settings, and profile
- **Delete single report** — hover a company row in the detail panel and click the trash icon

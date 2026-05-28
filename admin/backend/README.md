# Kompete Admin Backend

Standalone FastAPI service for the Kompete admin panel. Imports database and config modules from the main backend.

## Running

```bash
# From the repo root — activate the main backend venv
cd backend && source venv/bin/activate
cd ../admin/backend
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/admin/login` | Validate admin secret |
| `GET`  | `/admin/stats` | Platform aggregate stats |
| `GET`  | `/admin/users` | All users with report counts |
| `GET`  | `/admin/users/{id}/reports` | All reports for a user |
| `DELETE` | `/admin/users/{id}` | Delete all user data |
| `POST` | `/admin/users/{id}/reset-limit` | Reset free-tier limit |
| `DELETE` | `/admin/users/{id}/reports/{company}` | Delete a specific report |
| `GET`  | `/admin/reports` | All reports (all users) |
| `GET`  | `/admin/activity?days=30` | Daily activity chart data |

All endpoints except `/admin/login` require `X-Admin-Secret` header.

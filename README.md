# Public Admin Super App

Team schedule, Excel automation, complaint chatbot, and news collection scaffold built with:

- Frontend: React + TypeScript + Vite
- Backend: FastAPI
- Database: SQLite

## What is included

- Member management
- Schedule CRUD and calendar views
- Excel split/merge scaffolding
- Complaint manual upload and chatbot scaffolding
- News collection and keyword views
- Health checks for app and database

## Repository layout

```text
day3_rpa/
  frontend/
  backend/
  docs/
```

## Prerequisites

- Windows PowerShell
- Node.js and npm
- Python 3.14+
- `uv`

## Local development

### Backend

```powershell
cd C:\Users\admin\Desktop\day3_rpa\backend
uv sync
uv run uvicorn app.main:app --reload
```

### Frontend

```powershell
cd C:\Users\admin\Desktop\day3_rpa\frontend
npm.cmd install
npm.cmd run dev
```

## URLs

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`

## API overview

### Health

- `GET /api/health`
- `GET /api/db/health`

### Members

- `GET /api/members`
- `POST /api/members`
- `GET /api/members/{member_id}`
- `PUT /api/members/{member_id}`
- `DELETE /api/members/{member_id}`

### Schedules

- `GET /api/schedules`
- `POST /api/schedules`
- `GET /api/schedules/{schedule_id}`
- `PUT /api/schedules/{schedule_id}`
- `DELETE /api/schedules/{schedule_id}`

### Excel

- `POST /api/excel/split`
- `POST /api/excel/merge`
- `GET /api/excel/download/{file_id}`

### Complaints

- `POST /api/complaints/manuals`
- `GET /api/complaints/manuals`
- `POST /api/complaints/chat`

### News

- `GET /api/news`
- `POST /api/news/collect`
- `GET /api/news/keywords`

## First deployment notes

This repository now includes Docker-based deployment config and a Render blueprint.

Recommended first production setup:

1. Deploy the backend API first.
2. Move SQLite to a production database if persistence matters.
3. Deploy the frontend with the API base URL pointed to the backend.
4. Verify `GET /api/health` and `GET /api/db/health`.

Suggested target split:

- Backend: Render, Fly.io, Railway, or a similar Python host
- Frontend: Vercel, Netlify, or a similar static host

### Docker-based deployment

The repository now includes a Docker Compose setup for local validation or container-based deployment.

```powershell
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8000`

The frontend container serves the built SPA through Nginx and proxies `/api` to the backend container.

### Render deployment

The repository also includes `render.yaml` for a two-service Render setup:

- `vibe-3-api`: Docker-based FastAPI service with a persistent disk for SQLite
- `vibe-3-web`: Static site built from the Vite frontend

The frontend reads the backend host through `VITE_API_BASE_URL`, and the backend allows cross-origin requests through `CORS_ORIGINS`.

## Troubleshooting

- If `npm` fails in PowerShell, use `npm.cmd`.
- If `uv` is not found, confirm it is installed and on `PATH`.
- If the frontend cannot reach the backend, check the Vite proxy and CORS settings.
- If `GET /api/db/health` fails, confirm the SQLite file exists and the backend initialized the database.

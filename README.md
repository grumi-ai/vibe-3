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
- `GET /api/news/crawl-runs`
- `GET /api/news/keywords`

## Deployment notes

The repository is set up for:

- Frontend: GitHub Pages
- Backend: FastAPI exposed through Cloudflared Tunnel

Recommended production setup:

1. Create a Cloudflare Tunnel and point it to the backend service.
2. Set the backend `CORS_ORIGINS` to include your GitHub Pages origin.
3. Set the GitHub Pages `VITE_API_BASE_URL` to the tunnel hostname.
4. Verify `GET /api/health` and `GET /api/db/health`.

### Docker-based deployment

The repository now includes a Docker Compose setup for local validation or container-based deployment.

```powershell
docker compose up --build
```

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8000`

The frontend container serves the built SPA through Nginx and proxies `/api` to the backend container.

### GitHub Pages deployment

The repository includes `.github/workflows/deploy-frontend-pages.yml` for GitHub Pages.

What the workflow does:

- Builds the frontend on every push to `main`
- Uses the repository name as the Pages base path
- Reads the backend tunnel hostname from `vars.VITE_API_BASE_URL`
- Uploads `frontend/dist` and deploys it with GitHub Pages

What you need to do in GitHub:

1. Open the repository on GitHub.
2. Go to `Settings > Pages`.
3. Set `Build and deployment > Source` to `GitHub Actions`.
4. Go to `Settings > Secrets and variables > Actions`.
5. Add a repository variable named `VITE_API_BASE_URL`.
6. Set its value to the Cloudflared Tunnel public hostname, such as `https://api.example.com`.
7. Push to `main` or run the workflow from the Actions tab.

Notes:

- The site is built for a subpath like `/<repo-name>/`.
- `frontend/public/404.html` handles direct route refreshes.
- `frontend/public/.nojekyll` prevents GitHub Pages from treating underscore files specially.

### Cloudflared Tunnel deployment

The repository includes a `cloudflared` service in `docker-compose.yml`:

- Set `CLOUDFLARED_TUNNEL_TOKEN`
- Set the backend `CORS_ORIGINS` to include the GitHub Pages origin
- Run `docker compose --profile tunnel up --build`

The frontend reads the backend host through `VITE_API_BASE_URL`, and the backend allows cross-origin requests through `CORS_ORIGINS`.

## Post-deployment checklist

Use this after GitHub Pages and the Cloudflared Tunnel are connected:

1. Open the frontend URL and confirm the dashboard loads.
2. Open the backend health endpoint and confirm it returns `status: ok`.
3. Open the database health endpoint and confirm SQLite is initialized.
4. Create a member and a schedule from the UI, then refresh to confirm the data persists.
5. Open the browser network panel and confirm `/api` requests resolve to the backend host, not `localhost`.
6. Verify the frontend does not show CORS or fetch errors.
7. If anything fails, check the backend service logs first.

## Policy news crawling

The backend collects policy news from `https://www.korea.kr/news/policyNewsList.do`.

- Automatic collection runs every day at 09:00 Asia/Seoul for the previous day.
- Manual collection is available from the dashboard news section by selecting a date and clicking `Collect`.
- Articles are saved with title, source, agency, URL, summary, content, published date, and target date.
- Crawl runs are stored so operators can inspect success and failure counts.

## Troubleshooting

- If `npm` fails in PowerShell, use `npm.cmd`.
- If `uv` is not found, confirm it is installed and on `PATH`.
- If the frontend cannot reach the backend, check the Vite proxy and CORS settings.
- If `GET /api/db/health` fails, confirm the SQLite file exists and the backend initialized the database.

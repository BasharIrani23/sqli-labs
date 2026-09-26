# Deploying SQLi-Labs to Railway

This repo now works both locally (Docker Compose) and on Railway, using
the same Dockerfiles. The backend and frontend listen on whatever `$PORT`
the platform assigns at runtime instead of a hardcoded port, which is
what makes cloud deployment possible without touching the code.

## 0. Push to GitHub first

From inside the unzipped `sqli-labs` folder (PowerShell or Git Bash):

```bash
git init
git add .
git commit -m "Initial SQLi-Labs implementation"
```

Then create a new empty repo on github.com (no README/gitignore — you
already have those), and:

```bash
git remote add origin https://github.com/<your-username>/sqli-labs.git
git branch -M main
git push -u origin main
```

If `git` isn't recognized, install it from git-scm.com first.

## 1. Create the Railway project

1. Go to railway.app, sign in, **New Project → Deploy from GitHub repo**,
   pick `sqli-labs`.
2. Railway will try to auto-detect a service from the repo root — **delete
   that first guess**, you'll add three services manually (below), because
   this repo has three separate apps (db, backend, frontend) in one repo.

## 2. Add MySQL

**New → Database → Add MySQL.** Railway provisions it and exposes
connection variables automatically (`MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`,
`MYSQLPASSWORD`, `MYSQLDATABASE`).

Load the schema/seed once it's up — easiest way is Railway's built-in
MySQL query console (click the MySQL service → **Data** tab), paste the
contents of `backend/db/schema.sql`, run it, then paste
`backend/db/seed.sql`, run it.

## 3. Add the backend service

**New → GitHub Repo → same repo again.** In the new service's
**Settings**:
- **Root Directory**: `backend`
- Railway will detect the `Dockerfile` automatically.

In **Variables**, add (click "Add Reference" to pull from the MySQL
service instead of retyping values):
```
DB_HOST=${{MySQL.MYSQLHOST}}
DB_PORT=${{MySQL.MYSQLPORT}}
DB_USER=${{MySQL.MYSQLUSER}}
DB_PASSWORD=${{MySQL.MYSQLPASSWORD}}
DB_NAME=${{MySQL.MYSQLDATABASE}}
```

Under **Settings → Networking**, click **Generate Domain** to get a public
URL, e.g. `sqlilabs-backend-production.up.railway.app`. Copy it — you need
it in the next step.

## 4. Add the frontend service

**New → GitHub Repo → same repo again.**
- **Root Directory**: `frontend`
- **Variables**: add a build-time variable
  ```
  VITE_API_URL=https://sqlilabs-backend-production.up.railway.app
  ```
  (the backend URL from step 3, with `https://`)
- **Settings → Networking → Generate Domain**.

Redeploy the frontend after adding the variable (Railway usually does this
automatically on variable change; if not, trigger a manual redeploy) so
Vite bakes the correct API URL into the build.

## 5. Verify

- Backend health check: `https://<backend-domain>/api/health` → `{"status":"ok"}`
- Frontend: open `https://<frontend-domain>` and run through one challenge.

## Notes / gotchas

- **CORS**: `backend/app.py` currently allows all origins (`CORS(app)`),
  which is fine for a lab demo but worth tightening to your frontend's
  exact domain before sharing the link widely.
- **Order matters**: deploy the backend and generate its domain *before*
  building the frontend, since the frontend needs that URL baked in at
  build time (Vite env vars are compile-time, not runtime).
- **Render** works the same way in principle (GitHub repo → Dockerfile
  service, both respecting `$PORT`), but Render has no native MySQL
  add-on — you'd need an external MySQL host (e.g. PlanetScale, Railway's
  MySQL used cross-platform, or Render's own Postgres with the schema
  ported). Railway is the more direct path for this project as-is.

# SQLi-Labs

An interactive, containerized platform for teaching SQL Injection attacks
and defenses — Graduation Project, Faculty of Information Technology,
Middle East University.

**Team:** Alaa Asharf, Bassam Hamad, Yanal Al-Ali
**Supervisor:** Dr. Nadia Alfriehat

> ⚠️ **For isolated, educational use only.** This app contains
> intentionally vulnerable endpoints (SQL injection). Never expose it to
> the public internet or a shared network. Run it only inside Docker on a
> machine you control.

## What's here

Four challenges, each with a **Vulnerable** and a **Secure** mode you can
toggle live, plus a **Live Query Visualizer** that shows the exact SQL
that ran:

| # | Challenge | Scenario |
|---|-----------|----------|
| 1 | In-Band Error-Based | Product lookup by numeric ID; raw MySQL errors are reflected back |
| 2 | UNION-Based | Product search; extract a hidden `admin_secrets` table via `UNION SELECT` |
| 3 | Blind Boolean-Based | Login form; only a true/false signal leaks |
| 4 | Blind Time-Based | Username lookup; only response timing leaks (e.g. `SLEEP()`) |

**Stack:** React + Vite (frontend), Python Flask (backend), MySQL 8
(database), Docker Compose (orchestration).

## Quickstart

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/health
- MySQL: localhost:3306 (root / sqlilabs_root_pw — change this for anything beyond local dev)

First boot takes ~20–30s while MySQL initializes and seeds sample data
(`backend/db/schema.sql`, `backend/db/seed.sql`).

## Project layout

```
sqli-labs/
├── backend/
│   ├── app.py                  # Flask entrypoint, blueprint registration
│   ├── db_connection.py        # MySQL connection pool
│   ├── utils.py                # shared query/response helpers
│   ├── challenges/
│   │   ├── error_based.py
│   │   ├── union_based.py
│   │   ├── blind_boolean.py
│   │   └── blind_time.py
│   ├── db/
│   │   ├── schema.sql
│   │   └── seed.sql
│   ├── requirements.txt
│   ├── Dockerfile
│   └── wait-for-db.sh
├── frontend/
│   ├── src/
│   │   ├── pages/               # one page per challenge + Home
│   │   ├── components/          # ModeToggle, QueryVisualizer, HintPanel, ResultsTable
│   │   ├── api.js
│   │   └── App.jsx
│   ├── Dockerfile
│   └── nginx.conf
└── docker-compose.yml
```

## How Vulnerable vs. Secure mode works

Every challenge endpoint takes a `mode` field (`"vulnerable"` or
`"secure"`):

- **Vulnerable mode** builds the SQL query with raw Python f-string
  interpolation — the classic mistake. The constructed query string
  (with the attacker's payload inside it) is what actually executes.
- **Secure mode** uses a parameterized query (`%s` placeholders,
  `cursor.execute(query, params)`) — the driver sends the query template
  and the parameters separately, so injection is not possible.

Both modes return the query text to the frontend so the **Live Query
Visualizer** can show students what actually ran (or would have run).

## Local development without Docker

Backend:
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export DB_HOST=localhost DB_USER=root DB_PASSWORD=sqlilabs_root_pw DB_NAME=sqlilabs
flask --app app run --debug
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

You'll still need a MySQL instance reachable at `DB_HOST` — easiest is
`docker compose up db`.

## Resetting the database

```bash
docker compose down -v   # drops the db_data volume
docker compose up --build
```

## Mapping to the report

This implementation corresponds to the report's **Chapter 6
(Implementation)**: `backend/challenges/*.py` are the four core
SQLi categories from the Abstract/Objectives, `QueryVisualizer.jsx` is
the Live Query Visualizer, and the `mode` toggle throughout is the
Vulnerable/Secure dual-mode design described in Chapter 5
(Architecture and Design).

## Next steps / not yet implemented

- Automated tests (Chapter 7: unit/integration/security testing)
- Railway deployment config
- Progressive difficulty / scoring, described in slide 5 as a stretch goal
- Auth/session handling beyond the blind-boolean login demo

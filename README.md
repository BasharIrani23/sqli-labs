# SQLi-Labs

An interactive, containerized laboratory platform for teaching SQL Injection attacks
and defenses — Graduation Project, Faculty of Information Technology,
Middle East University.

**Team:** Alaa Asharf, Bassam Hamad, Yanal Al-Ali  
**Supervisor:** Dr. Nadia Alfriehat

> ⚠️ **For isolated, educational use only.** This application contains
> intentionally vulnerable endpoints (SQL injection). Never expose it to
> the public internet or a shared network. Run it only inside an isolated container
> or controlled local environment.

---

## Overview & Architecture

SQLi-Labs provides a hands-on cybersecurity training environment covering the four fundamental categories of SQL injection. Every challenge implements a live dual-mode architecture:

- **Vulnerable Mode:** Unsafe string interpolation (`f"SELECT ... {input}"`) executes raw user input directly inside the database, demonstrating real-world vulnerabilities and data exfiltration.
- **Secure Mode:** Industry-standard parameterized prepared queries (`cursor.execute("SELECT ... %s", (param,))`) transmit SQL templates and user parameters in separate protocol phases, demonstrating how parameterization neutralizes SQL injection.

```
SQLi-Labs Platform Architecture
┌─────────────────────────────────────────────────────────────┐
│ React 18 + Vite Frontend (Port 41882 / 3000)                │
│  ├── Live Query Visualizer & SQL Syntax Tokenizer           │
│  ├── Injected Payload Diff & Highlight Engine               │
│  ├── Execution Latency Meter & Side-Channel Timing Bar      │
│  ├── Interactive Injection Playbook (24+ Real Scenarios)    │
│  ├── Database Schema Explorer & 1-Click DB Reset            │
│  └── Progressive Step-by-Step Hint Walkthroughs             │
└───────────────────────────┬─────────────────────────────────┘
                            │ REST JSON API
┌───────────────────────────▼─────────────────────────────────┐
│ Python 3.12 Flask Backend (Port 5000)                       │
│  ├── Error-Based Reflection Engine (/api/challenge/error)   │
│  ├── UNION-Based Search Engine (/api/challenge/union)       │
│  ├── Blind Boolean Inference Engine (/api/challenge/blind)  │
│  ├── Blind Time-Delay Side-Channel (/api/challenge/time)    │
│  ├── Schema Inspector (/api/schema)                         │
│  └── Live Database Reset Facility (/api/reset-db)           │
└───────────────────────────┬─────────────────────────────────┘
                            │ Pooled MySQL Connector
┌───────────────────────────▼─────────────────────────────────┐
│ MariaDB / MySQL 8.0 Database (Port 3306)                    │
│  ├── products (Public catalog items)                        │
│  ├── users (Authentication accounts)                        │
│  └── admin_secrets (Confidential CTF flags & API keys)      │
└─────────────────────────────────────────────────────────────┘
```

---

## The Four Core Challenge Laboratories

| # | Challenge | Target | Parameter Context | Primary Techniques & Objectives |
|---|-----------|--------|-------------------|---------------------------------|
| **01** | **In-Band Error-Based** | `products.id` | Numeric (unquoted) | • Force MySQL errors via `EXTRACTVALUE()` & `UPDATEXML()`<br>• Tautology table dump (`1 OR 1=1`)<br>• Exfiltrate database version and active schema in-band |
| **02** | **UNION-Based** | `products.name` | String (`LIKE '%...%'`) | • Column count discovery via `ORDER BY 3-- -`<br>• Column projection & type alignment<br>• Traverse `information_schema.tables`<br>• Exfiltrate secret CTF flag from `admin_secrets` |
| **03** | **Blind Boolean-Based** | `users` credentials | String (`username`, `password`) | • Authentication bypass via `' OR '1'='1`<br>• Password verification truncation (`admin'-- -`)<br>• Infer password length (`LENGTH(password)=11`)<br>• Binary character probing (`SUBSTRING()`) |
| **04** | **Blind Time-Based** | `users.username` | String (lookup) | • Unconditional timing delays (`SLEEP(2)`)<br>• Conditional execution (`IF(condition, SLEEP(2), 0)`)<br>• Response latency analysis on visual timing bar<br>• Side-channel inference of database name length |

---

## Major Enhancements & Key Features

### 1. Modernized Security-Terminal UI/UX
- Responsive, dark cybersecurity-lab theme with typography (`DM Sans` + `DM Mono`), elevation shadows, and status indicators.
- Live database connection status monitor (`Connected: MariaDB 10.11` / `Offline`).
- Global and challenge-level **Dual-Mode Switcher** with real-time architectural explanations.
- Fully responsive desktop two-column split and mobile-optimized card layouts.

### 2. Enhanced Hits Display & Real-Time Query Visualizer
- **SQL Syntax Tokenizer & Highlighter:** Syntax-highlights SQL keywords, strings, numbers, comments, and identifiers.
- **Injected Payload Highlighter:** Pinpoints and pulses the exact user payload within the generated SQL command.
- **Query Diff & Inspection Tab:** Contrasts the intended developer query against the actual executed query to expose parser alterations.
- **Execution Latency Meter:** Displays exact server query latency with a visual progress bar and alert flags for time-delay side channels (>1500 ms).
- **Leaked Secret Extractor:** Automatically parses XPath error reflections (e.g. `XPATH syntax error: '~...'`) and highlights leaked values in an exfiltrated secret callout card.
- **Enhanced Results Grid:** Formatted table with row counters, search filtering, and automatic badges for exfiltrated CTF flags (`FLAG{...}`).
- **Raw JSON Inspector:** Full JSON envelope inspector with 1-click clipboard copying.

### 3. Comprehensive Injection Playbook & Examples
- Built-in library of **24+ realistic attack scenarios and defense checks** categorized by difficulty (`Beginner`, `Intermediate`, `Advanced`).
- **1-Click "Load Payload"** into forms for instant hands-on experimentation.
- Deep explanations of SQL parser mechanics, real-world context, and side-by-side expected responses for both Vulnerable and Secure modes.
- **Progressive Hint Walkthrough:** Step-by-step guidance that can be revealed progressively or all at once.

### 4. Live Database Explorer & Sandbox Reset
- Built-in **Database Schema Explorer** accessible from the navigation bar, displaying tables (`products`, `users`, `admin_secrets`), column definitions, data types, and row counts.
- **1-Click Database Reset** (`POST /api/reset-db`) allowing students to restore initial seed data anytime.

---

## Quickstart Guide

### Option 1: Running with Docker Compose (Recommended)

```bash
docker compose up --build
```

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api/health
- **MySQL Database:** localhost:3306 (`root` / `sqlilabs_root_pw`)

### Option 2: Running Locally Without Docker

#### Prerequisites
- Node.js 18+ and npm
- Python 3.10+
- MariaDB or MySQL running locally with database `sqlilabs`

#### 1. Initialize Database
```bash
mariadb -u root -psqlilabs_root_pw -e "CREATE DATABASE IF NOT EXISTS sqlilabs;"
mariadb -u root -psqlilabs_root_pw sqlilabs < backend/db/schema.sql
mariadb -u root -psqlilabs_root_pw sqlilabs < backend/db/seed.sql
```

#### 2. Start Backend API
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export DB_HOST=127.0.0.1 DB_PORT=3306 DB_USER=root DB_PASSWORD=sqlilabs_root_pw DB_NAME=sqlilabs
python3 app.py
```
Backend runs on `http://127.0.0.1:5000`.

#### 3. Start Frontend Dev Server
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:41882` (with automatic `/api` proxy to backend).

---

## Project Structure

```
sqli-labs/
├── backend/
│   ├── app.py                  # Flask application entrypoint & API endpoints
│   ├── db_connection.py        # MySQL connection pooling
│   ├── utils.py                # Timed execution, serialization & JSON envelopes
│   ├── challenges/
│   │   ├── error_based.py      # Challenge 1: In-Band Error-Based
│   │   ├── union_based.py      # Challenge 2: UNION-Based
│   │   ├── blind_boolean.py    # Challenge 3: Blind Boolean-Based
│   │   └── blind_time.py       # Challenge 4: Blind Time-Based
│   ├── db/
│   │   ├── schema.sql          # Table definitions (users, products, admin_secrets)
│   │   └── seed.sql            # Seed records & CTF flags
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Header with DB health & schema modal
│   │   │   ├── ModeToggle.jsx      # Dual-mode switcher
│   │   │   ├── HitsDisplay.jsx     # Live SQL visualizer, diff & latency meter
│   │   │   ├── ResultsTable.jsx    # Result grid with secret detection
│   │   │   ├── ExamplesPanel.jsx   # Interactive injection playbook
│   │   │   ├── HintPanel.jsx       # Progressive step-by-step hints
│   │   │   └── SchemaModal.jsx     # Database explorer & reset tool
│   │   ├── data/
│   │   │   └── challengeData.js    # Comprehensive challenge data & 24+ payloads
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Modern overview & architecture guide
│   │   │   ├── ErrorBased.jsx      # Challenge 1 page
│   │   │   ├── UnionBased.jsx      # Challenge 2 page
│   │   │   ├── BlindBoolean.jsx    # Challenge 3 page
│   │   │   └── BlindTime.jsx       # Challenge 4 page
│   │   ├── utils/
│   │   │   └── sqlHighlighter.jsx  # SQL tokenizer & payload highlighter
│   │   ├── api.js                  # Frontend API client
│   │   ├── App.jsx                 # Route manager & modal state
│   │   ├── index.css               # Modern dark cybersecurity styles
│   │   └── main.jsx                # React root
│   ├── index.html
│   ├── vite.config.js              # Vite server & proxy configuration
│   └── package.json
└── docker-compose.yml
```

---

## Educational Notice
This graduation project was developed for the **Faculty of Information Technology at Middle East University** under the supervision of **Dr. Nadia Alfriehat**. All rights reserved for academic and instructional research.

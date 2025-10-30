# App Workspace

This repository contains a minimal full-stack scaffold:

- client/ — Vite + React + TypeScript frontend
- server/ — Express + TypeScript backend with Elasticsearch integration

Quick start (PowerShell):

1. Copy `.env.example` to `.env` and set Elasticsearch variables.
2. Install dependencies at root (this installs client and server devDeps):

```powershell
npm install
```

3. Run development servers (root):

```powershell
npm run dev
```

This will start the server on port 4000 and the client on Vite's default port (usually 5173).

Server endpoints:
- GET /api/health — ES connection status
- GET /api/items?q=... — search items (optional q)
- POST /api/items — insert an item JSON payload

See `client/` and `server/` folders for more details.

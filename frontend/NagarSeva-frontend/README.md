<<<<<<< HEAD
# NagarSeva 🏛️

A full-stack civic complaint resolution platform for Indian municipalities.
Citizens file geo-tagged complaints, officials respond, and SLA timers ensure accountability.

## 🔗 Repositories

| Part | Stack | Folder |
|------|-------|--------|
| Backend | Spring Boot · PostgreSQL + PostGIS · Redis | `/grievance-backend` |
| Frontend | Next.js · TypeScript · Tailwind · Leaflet | `/grievance-frontend` |

## ✨ Key Features

- **Geo-tagged complaints** — PostGIS auto-assigns complaints to the correct ward via GPS
- **Redis SLA engine** — 48h TTL keys auto-escalate breached complaints
- **Live map** — Real-time Leaflet map with color-coded complaint pins
- **Role-based access** — Citizen / Official / Admin with JWT auth
- **Status history** — Full audit trail of every status change
- **WebSocket updates** — Citizens get live notifications on status change

## 🛠️ Tech Stack

**Backend** — Java 21 · Spring Boot 4 · PostgreSQL 18 + PostGIS · Redis · Flyway · Docker

**Frontend** — Next.js 16 · TypeScript · Tailwind CSS · shadcn/ui · Leaflet · Axios

## 🚀 Quick Start

```bash
# Backend
cd grievance-backend
cp src/main/resources/application.properties.example src/main/resources/application.properties
./mvnw spring-boot:run

# Frontend
cd grievance-frontend
=======
# NagarSeva Frontend

Next.js 16 + TypeScript frontend for the NagarSeva civic complaint platform.

## Setup

```bash
>>>>>>> e7f7318 (final: for deployment)
npm install
npm run dev
```

<<<<<<< HEAD
Open `http://localhost:3000`
=======
Open http://localhost:3000

## Pages
- `/` — Landing page
- `/login` — Sign in
- `/register` — Create account  
- `/dashboard` — My complaints
- `/complaints/new` — File a complaint
- `/map` — Live complaint map
>>>>>>> e7f7318 (final: for deployment)

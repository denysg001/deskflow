# DeskFlow

DeskFlow is a complete MVP help desk and service request system for coworking spaces. Clients access the portal through a QR Code, create service requests, follow ticket history, add comments and attachments. Administrators manage tickets, clients, users, categories, request types, locations, suppliers, dashboards, reports and SLA tracking.

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, shadcn-style components, Radix-compatible structure, Lucide, Recharts, QR Code
- Backend: Node.js, Fastify, JWT, Zod validation
- Database: PostgreSQL with Prisma ORM
- Reports: JSON, CSV and browser-generated PDF
- Local infrastructure: Docker Compose with PostgreSQL, API, Web and Adminer

## Run Locally

Copy the environment sample if you want to customize values:

```bash
cp .env.example .env
```

Start everything:

```bash
docker compose up -d
```

Docker automatically starts PostgreSQL, applies Prisma migrations, seeds test data, starts the API and starts the web application.

## Access URLs

- App: http://localhost:3000
- API: http://localhost:3001
- API health: http://localhost:3001/health
- Adminer: http://localhost:8080
- Client portal QR target: http://localhost:3000/portal

## Default Users

Admin:

- Email: `admin@cowork.local`
- Password: `Admin@123`

Operator:

- Email: `operador@cowork.local`
- Password: `Operador@123`

Client:

- Email: `cliente@cowork.local`
- Password: `Cliente@123`

## Database Access

Open Adminer at http://localhost:8080 and use:

- System: PostgreSQL
- Server: `postgres`
- Username: `deskflow`
- Password: `deskflow`
- Database: `deskflow`

## Useful Commands

```bash
docker compose logs -f
docker compose logs -f api
docker compose logs -f web
docker compose down
```

Reset the local database:

```bash
docker compose down -v
docker compose up -d
```

Run local checks without Docker:

```bash
npm install
npm run build
npm test
```

If your machine has a broken global npm cache, use a local cache:

```bash
npm_config_cache=.npm-cache npm install
```

## MVP Features

- JWT login and logout
- Role-based access control for Admin, Operator and Client
- Client data isolation
- Ticket creation with category, request type, priority, location, description and optional attachment
- Ticket list with search, filters, pagination, status badges and overdue SLA indicator
- Ticket status updates, operator assignment, public comments and internal notes
- Client portal with new ticket, history and profile
- Admin dashboard with cards and charts
- Admin management for clients, users, categories, request types, locations and suppliers
- Reports by client, category, operator, status and location
- CSV export and PDF export
- QR Code for client portal access
- Prisma migrations and seed data

## Troubleshooting

If the API starts before the database is ready, restart it:

```bash
docker compose restart api
```

If ports are already in use, stop the conflicting service or change the mapped ports in `docker-compose.yml`.

If you want a clean database, run `docker compose down -v` and then `docker compose up -d`.

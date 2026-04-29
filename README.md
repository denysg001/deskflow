# DeskFlow

DeskFlow is a complete MVP help desk and service request system for coworking spaces. Clients access the portal through a QR Code, create service requests, follow ticket history, add comments and attachments. Administrators manage tickets, clients, users, categories, request types, locations, suppliers, dashboards, reports and SLA tracking.

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, shadcn-style components, Radix-compatible structure, Lucide, Recharts, QR Code
- Backend: Node.js, Fastify, JWT, Zod validation
- Database: PostgreSQL with Prisma ORM
- Reports: JSON, CSV and browser-generated PDF
- Local infrastructure: Docker Compose with PostgreSQL, API, Web and Adminer

## How to Open the Program

Follow these steps to run DeskFlow on a MacBook or any computer with Docker.

### 1. Install the required programs

Install Docker Desktop:

- Download: https://www.docker.com/products/docker-desktop/
- Open Docker Desktop after installing it
- Wait until Docker shows that it is running

Install Git if your computer does not have it yet:

- Download: https://git-scm.com/downloads

### 2. Download the project

Open Terminal and run:

```bash
git clone https://github.com/denysg001/deskflow.git
```

Enter the project folder:

```bash
cd deskflow
```

### 3. Create the environment file

Run this command to create the local configuration file:

```bash
cp .env.example .env
```

### 4. Start the program

Run:

```bash
docker compose up -d
```

Docker automatically starts PostgreSQL, applies Prisma migrations, seeds test data, starts the API and starts the web application.

### 5. Open in the browser

After the command finishes, open:

- DeskFlow app: http://localhost:3000
- Client portal: http://localhost:3000/portal
- API: http://localhost:3001
- Database admin panel: http://localhost:8080

### 6. Login

Use one of the test users below.

Admin:

- Email: `admin@cowork.local`
- Password: `Admin@123`

Operator:

- Email: `operador@cowork.local`
- Password: `Operador@123`

Client:

- Email: `cliente@cowork.local`
- Password: `Cliente@123`

## Quick Start

If Docker Desktop is already installed and running:

```bash
git clone https://github.com/denysg001/deskflow.git
cd deskflow
cp .env.example .env
docker compose up -d
```

Then open http://localhost:3000.

## Access URLs

- App: http://localhost:3000
- API: http://localhost:3001
- API health: http://localhost:3001/health
- Adminer: http://localhost:8080
- Client portal QR target: http://localhost:3000/portal

## Default Test Users

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

# 🗺️ Group Travel Planner

A collaborative web app for planning group trips and splitting expenses fairly.

## 🏗️ Architecture

- **Frontend**: React + Vite
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth

## 📁 Project Structure

```
group-travel-planner/
├── database/           # Database schema, policies, and seed data
│   ├── schema.sql
│   ├── rls_policies.sql
│   └── seed.sql
├── src/
│   ├── components/     # React components (Person A)
│   ├── lib/           # API services (Person C)
│   ├── mockData/      # Mock data for development
│   └── App.jsx
└── package.json
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd group-travel-planner
npm install
```

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the SQL files in this order:
   - `database/schema.sql` — creates tables and indexes
   - `database/rls_policies.sql` — sets up security policies
   - `database/seed.sql` — loads sample Barcelona trip data

### 3. Environment Configuration

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

Get your credentials from Supabase Dashboard → Settings → API:
- `VITE_SUPABASE_URL`: Your project URL
- `VITE_SUPABASE_ANON_KEY`: Your anon/public key

### 4. Run Development Server

```bash
npm run dev
```

## 🌿 Git Workflow

- `main` — production-ready code
- `dev` — integration branch
- `feature/*` — feature branches

**Branch ownership:**
- `feature/frontend-dashboard` — Person A (Components)
- `feature/database-schema` — Person B (Database)
- `feature/api-services` — Person C (Services)

All PRs target `dev` first, never `main` directly.

## 📊 Database Schema

See [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) for complete schema documentation.

### Core Tables

- `trips` — Trip metadata and budget
- `trip_members` — User membership in trips
- `itinerary_items` — Timeline activities
- `expenses` — Individual bills
- `expense_splits` — Who owes what

## 🔐 Security

Row Level Security (RLS) is enabled on all tables. Users can only:
- View trips they're members of
- Add expenses to their trips
- View splits for their trips

## 👥 Team Coordination

- **Person A** (Frontend): Check `DATABASE_SCHEMA.md` for exact column names
- **Person B** (Database): Tag others when schema changes
- **Person C** (Services): Match service functions to schema exactly

## 📝 License

MIT

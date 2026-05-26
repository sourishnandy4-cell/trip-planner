# 🌍 Group Travel Planner

A modern, collaborative dashboard for planning group trips with itinerary management, expense tracking, and balance settlement.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 👥 Team Structure

- **Person A (Frontend)**: UI components and layout (`src/components/`, `src/App.jsx`)
- **Person B (Database)**: Supabase schema and policies (`database/`)
- **Person C (API Services)**: Data layer and Supabase integration (`src/lib/`)

## 🌿 Branch Strategy

- `main` - Production
- `dev` - Integration branch
- `feature/frontend-dashboard` - Person A's work
- `feature/database-schema` - Person B's work
- `feature/api-services` - Person C's work

## 📦 Current Status

✅ Frontend components built with mock data
⏳ Awaiting database schema (Person B)
⏳ Awaiting API services (Person C)

## 🎨 Tech Stack

- React 18
- Tailwind CSS
- Recharts (data visualization)
- Lucide React (icons)
- Vite (build tool)

## 🔄 Integration Notes

All components currently use `src/mockData/index.js`. Person C will replace these imports with live Supabase calls once the schema is ready.

Look for `// TODO: swap mock data` comments in the codebase.

# 🚀 Quick Reference Card

## For Person B (You)

### Your Files
```
database/
├── schema.sql          ← Run this FIRST in Supabase
├── rls_policies.sql    ← Run this SECOND
├── seed.sql            ← Run this THIRD (after updating UUIDs)
└── SCHEMA_DIAGRAM.md   ← Visual reference

DATABASE_SCHEMA.md      ← Share this with team
SETUP_GUIDE.md          ← Follow this step-by-step
COORDINATION.md         ← Team communication guide
```

### Setup Checklist
```bash
□ Create Supabase project
□ Run schema.sql
□ Run rls_policies.sql
□ Create 3 test users
□ Update seed.sql with real UUIDs
□ Run seed.sql
□ Verify data in tables
□ Test RLS policies
□ Share credentials with team
```

---

## For Person A (Frontend)

### Your Files
```
src/
├── components/         ← Build your components here
│   ├── Sidebar.jsx
│   ├── Header.jsx
│   ├── ItineraryTimeline.jsx
│   ├── BudgetPieChart.jsx
│   ├── RecentExpenses.jsx
│   └── BalanceSheet.jsx
├── mockData/
│   └── index.js        ← Use this for development
└── App.jsx             ← Assemble components here
```

### Data Reference
- **Schema**: See `DATABASE_SCHEMA.md`
- **Mock data**: Import from `src/mockData/index.js`
- **Column names**: Match exactly from schema docs

### Critical Values (Must Match Exactly)
```javascript
// Itinerary category icons
'activity' | 'food' | 'transport' | 'music' | 'accommodation'

// Expense categories
'Accommodation' | 'Food & Drinks' | 'Activities' | 'Transport'
```

---

## For Person C (Services)

### Your Files
```
src/lib/
├── supabaseClient.js      ← Initialize Supabase
├── itineraryService.js    ← CRUD for itinerary
├── expenseService.js      ← CRUD for expenses
└── balanceCalculator.js   ← Calculate balances
```

### Key Points
- All IDs are **UUIDs** (not integers)
- All timestamps are **TIMESTAMPTZ** (ISO 8601)
- All money is **DECIMAL(10,2)**
- RLS is enabled (queries run as authenticated user)

### Example Queries
See `DATABASE_SCHEMA.md` → "Usage Examples" section

---

## Common Commands

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Environment Setup
```bash
cp .env.example .env
# Then edit .env with Supabase credentials
```

### Git Workflow
```bash
# Person A
git checkout -b feature/frontend-dashboard

# Person B
git checkout -b feature/database-schema

# Person C
git checkout -b feature/api-services

# All PRs target 'dev' branch
git push origin <your-branch>
```

---

## Supabase Quick Access

### Dashboard Sections
- **Table Editor**: View/edit data
- **SQL Editor**: Run queries
- **Authentication**: Manage users
- **Settings → API**: Get credentials

### Test Users (After Setup)
```
alice@example.com / TestPass123!
bob@example.com / TestPass123!
charlie@example.com / TestPass123!
```

---

## File Purpose Summary

| File | Purpose | Owner |
|------|---------|-------|
| `database/schema.sql` | Table definitions | Person B |
| `database/rls_policies.sql` | Security rules | Person B |
| `database/seed.sql` | Sample data | Person B |
| `DATABASE_SCHEMA.md` | Schema docs | Person B |
| `SETUP_GUIDE.md` | Supabase setup | Person B |
| `src/components/*.jsx` | UI components | Person A |
| `src/mockData/index.js` | Mock data | Person A |
| `src/lib/*.js` | API services | Person C |
| `README.md` | Project overview | All |
| `COORDINATION.md` | Team guide | All |

---

## Need Help?

### Person B Questions
- Schema design → `DATABASE_SCHEMA.md`
- Setup steps → `SETUP_GUIDE.md`
- Team coordination → `COORDINATION.md`

### Person A Questions
- What data is available? → `src/mockData/index.js`
- What are the column names? → `DATABASE_SCHEMA.md`
- How to structure components? → `src/components/README.md`

### Person C Questions
- What tables exist? → `DATABASE_SCHEMA.md`
- What queries to write? → `DATABASE_SCHEMA.md` → "Usage Examples"
- How to initialize Supabase? → Supabase docs

---

## Success Metrics

### Person B Done When:
- ✅ All SQL files run without errors
- ✅ Seed data visible in Supabase
- ✅ RLS test passes
- ✅ Team has credentials

### Person A Done When:
- ✅ All 6 components built
- ✅ Components use mock data
- ✅ UI matches design
- ✅ Ready for Person C integration

### Person C Done When:
- ✅ All 4 service files built
- ✅ CRUD operations work
- ✅ Person A can swap mock → live
- ✅ Balance calculation correct

---

## Integration Checklist

When Person C is ready:

```javascript
// Person A changes this:
import { mockItineraryItems } from './mockData';

// To this:
import { getItineraryItems } from './lib/itineraryService';
```

Test with real Supabase data, verify UI still works!

---

**Keep this file open while working!** 📌

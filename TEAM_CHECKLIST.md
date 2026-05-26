# 👥 Team Collaboration Checklist

## 🎯 Project Status Overview

```
┌─────────────────────────────────────────────────────────┐
│  Person A (Frontend)     ✅ COMPLETE                     │
│  Person B (Database)     ⏳ IN PROGRESS                  │
│  Person C (API Services) ⏳ WAITING FOR PERSON B         │
└─────────────────────────────────────────────────────────┘
```

---

## 👤 Person A - Frontend Developer ✅

### Completed Tasks
- ✅ All 6 components built and styled
- ✅ Responsive layout implemented
- ✅ Design system applied (colors, typography, spacing)
- ✅ Mock data structure defined with JSDoc types
- ✅ Component documentation written
- ✅ Integration notes prepared for Person C
- ✅ PR template created

### Your Next Actions
1. ✅ Run `npm install` to verify dependencies
2. ✅ Run `npm run dev` to test locally
3. ✅ Open PR to `dev` branch
4. ✅ Tag Person B: "Please review mock data shapes"
5. ✅ Tag Person C: "Ready for API integration"

### Files to Review Before PR
- [ ] `src/App.jsx` - Main component
- [ ] `src/components/*.jsx` - All 6 components
- [ ] `src/mockData/index.js` - Data contracts
- [ ] `PERSON_A_DELIVERABLES.md` - Your checklist

---

## 👤 Person B - Database Developer ⏳

### Your Tasks
- [ ] Review `src/mockData/index.js` for data shapes
- [ ] Create `database/schema.sql`
  - [ ] `trips` table
  - [ ] `itinerary_items` table
  - [ ] `expenses` table
  - [ ] `expense_categories` table
  - [ ] `balances` table
- [ ] Create `database/rls_policies.sql`
- [ ] Create `database/seed.sql` with sample data
- [ ] Test schema in Supabase
- [ ] Tag Person C: "Schema ready for integration"

### Key Files to Reference
- `src/mockData/index.js` - Expected data shapes
- `database/README.md` - Your task overview
- `INTEGRATION_NOTES.md` - Data contracts

### Coordination Points
- Confirm column names with Person C
- Ensure data types match mock data
- Verify foreign key relationships

---

## 👤 Person C - API Services Developer ⏳

### Prerequisites
- ⏳ Wait for Person B to complete database schema
- ⏳ Confirm Supabase project is set up

### Your Tasks
- [ ] Create `.env` file with Supabase credentials
- [ ] Create `src/lib/supabaseClient.js`
- [ ] Create `src/lib/itineraryService.js`
  - [ ] `getTripMeta(tripId)`
  - [ ] `getItineraryItems(tripId)`
- [ ] Create `src/lib/expenseService.js`
  - [ ] `getExpenseCategories(tripId)`
  - [ ] `getRecentExpenses(tripId)`
  - [ ] `getBalances(tripId)`
- [ ] Create `src/lib/balanceCalculator.js`
- [ ] Update `src/App.jsx` to use your services
- [ ] Add loading states to components
- [ ] Add error handling
- [ ] Test with Person A's components
- [ ] Open PR to `dev` branch

### Key Files to Reference
- `src/mockData/index.js` - Function signatures to match
- `src/lib/README.md` - Your task overview
- `INTEGRATION_NOTES.md` - Integration guide
- `COMPONENTS.md` - Component prop requirements

### Integration Steps
1. Replace mock imports in `src/App.jsx`
2. Convert to async data fetching (useState + useEffect)
3. Add loading spinners
4. Add error boundaries
5. Test all components with live data

---

## 🔄 Integration Workflow

```
Step 1: Person B completes schema
   ↓
Step 2: Person C builds API services
   ↓
Step 3: Person C integrates with Person A's components
   ↓
Step 4: All team members review integration PR
   ↓
Step 5: Merge to dev branch
   ↓
Step 6: Test complete application
   ↓
Step 7: Merge dev to main
```

---

## 📋 PR Review Checklist

### When Person A Opens PR
- [ ] All components render without errors
- [ ] Responsive design works on all screen sizes
- [ ] Design system colors and fonts applied
- [ ] Mock data structure is clear and documented
- [ ] No console errors or warnings

### When Person B Opens PR
- [ ] Schema matches mock data shapes
- [ ] All tables have proper indexes
- [ ] RLS policies are in place
- [ ] Seed data loads successfully
- [ ] Foreign keys are properly defined

### When Person C Opens PR
- [ ] All service functions return correct data shapes
- [ ] Loading states are implemented
- [ ] Error handling is in place
- [ ] Components render with live data
- [ ] No Supabase errors in console
- [ ] Environment variables documented

---

## 🚨 Common Issues & Solutions

### Issue: Components not rendering
**Solution**: Check that all props match the expected shapes in `COMPONENTS.md`

### Issue: Tailwind styles not applying
**Solution**: Run `npm install` and restart dev server

### Issue: Mock data shape doesn't match database
**Solution**: Person B and Person C should coordinate on column names

### Issue: Supabase connection failing
**Solution**: Verify `.env` file has correct credentials

---

## 📞 Communication Protocol

### When to Tag Team Members

**Tag Person A when:**
- Database schema requires frontend changes
- API response shape differs from mock data
- New component props are needed

**Tag Person B when:**
- Need to add/modify database columns
- RLS policies need adjustment
- Seed data needs updating

**Tag Person C when:**
- Components are ready for API integration
- New data fetching requirements emerge
- Error handling needs improvement

---

## 🎉 Definition of Done

### Feature is complete when:
- ✅ All PRs merged to `dev` branch
- ✅ Application runs without errors
- ✅ All components display live data
- ✅ Responsive design works on all devices
- ✅ Loading states implemented
- ✅ Error handling in place
- ✅ Code reviewed by all team members
- ✅ Documentation updated

---

## 📚 Quick Reference

### Important Files
- `QUICKSTART.md` - Setup instructions
- `COMPONENTS.md` - Component API docs
- `INTEGRATION_NOTES.md` - Handoff guide
- `ARCHITECTURE.md` - System design
- `PERSON_A_DELIVERABLES.md` - Person A checklist

### Useful Commands
```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Build for production
git checkout dev     # Switch to dev branch
git pull origin dev  # Get latest changes
```

### Branch Strategy
- `main` - Production (protected)
- `dev` - Integration branch
- `feature/frontend-dashboard` - Person A
- `feature/database-schema` - Person B
- `feature/api-services` - Person C

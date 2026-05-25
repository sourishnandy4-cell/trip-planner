# 🤝 Team Coordination Guide

## Person B Deliverables — ✅ COMPLETE

As the Database Architect, you have completed:

### ✅ Files Created

1. **`database/schema.sql`** — Complete PostgreSQL schema
   - 5 tables with proper constraints
   - Indexes for performance
   - Triggers for auto-updating timestamps
   - Helper view for trip summaries

2. **`database/rls_policies.sql`** — Row Level Security
   - Policies for all 5 tables
   - Helper functions for membership checks
   - Proper permission grants

3. **`database/seed.sql`** — Sample Barcelona trip data
   - 1 trip with 3 members
   - 12 itinerary items across 4 days
   - 4 expenses with splits
   - Matches mock data exactly

4. **`DATABASE_SCHEMA.md`** — Complete documentation
   - Table structures with all columns
   - Valid enum values
   - Relationship diagrams
   - Example queries
   - Change protocol

5. **`README.md`** — Setup instructions
   - Supabase configuration steps
   - Environment setup
   - Git workflow
   - Team coordination notes

6. **`.env.example`** — Environment template

### 📋 Next Steps for Person B

1. **Create Supabase Project**
   ```bash
   # Go to https://supabase.com
   # Create new project
   # Note your project URL and anon key
   ```

2. **Run SQL Files in Order**
   - Open Supabase Dashboard → SQL Editor
   - Run `database/schema.sql` first
   - Run `database/rls_policies.sql` second
   - Create 3 test users in Auth (Settings → Authentication)
   - Update UUIDs in `database/seed.sql`
   - Run `database/seed.sql` last

3. **Share Credentials with Team**
   - Share Supabase URL and anon key
   - Share test user credentials
   - Point team to `DATABASE_SCHEMA.md`

4. **Monitor for Questions**
   - Watch for GitHub issues tagged with `database`
   - Respond to schema clarification requests
   - Review PRs that touch database queries

---

## 📞 Communication Protocols

### When Person A Needs You

**Scenario**: "What's the exact column name for...?"
- **Response**: Point them to `DATABASE_SCHEMA.md` section
- **If not documented**: Add it to the schema doc immediately

**Scenario**: "Can we add a new field to...?"
- **Response**: 
  1. Assess impact on existing data
  2. Write migration SQL
  3. Update `DATABASE_SCHEMA.md`
  4. Tag Person C to update services

### When Person C Needs You

**Scenario**: "This query is slow..."
- **Response**: Check if proper index exists, add if needed

**Scenario**: "Should I handle this in the app or database?"
- **Response**: 
  - Calculations → Database (use views or functions)
  - Business logic → Application
  - Data validation → Both (constraints + app validation)

---

## 🔄 Schema Change Workflow

If you need to modify the schema after others have started:

1. **Create a migration file**: `database/migrations/001_add_column.sql`
2. **Update `DATABASE_SCHEMA.md`**
3. **Open PR with both files**
4. **Tag affected team members**:
   - Person A if it affects mock data structure
   - Person C if it affects service functions
5. **Wait for approval before merging**

---

## 🎯 Critical Data Contracts

These values MUST match exactly across all layers:

### Itinerary Category Icons
```javascript
'activity' | 'food' | 'transport' | 'music' | 'accommodation'
```

### Expense Categories
```javascript
'Accommodation' | 'Food & Drinks' | 'Activities' | 'Transport'
```

### User Roles
```javascript
'owner' | 'member'
```

**If you change these**, you must:
1. Update the CHECK constraint in SQL
2. Update `DATABASE_SCHEMA.md`
3. Update `src/mockData/index.js`
4. Notify Person A and Person C

---

## 🐛 Common Issues & Solutions

### Issue: "RLS is blocking my queries"

**Solution**: Check if the user is a trip member
```sql
SELECT is_trip_member('<trip_id>');
```

### Issue: "Foreign key constraint violation"

**Solution**: Ensure parent records exist first
```sql
-- Check if trip exists
SELECT id FROM trips WHERE id = '<trip_id>';

-- Check if user exists
SELECT id FROM auth.users WHERE id = '<user_id>';
```

### Issue: "Seed data won't insert"

**Solution**: Replace demo UUIDs with real auth.users IDs
```sql
-- Get real user IDs
SELECT id, email FROM auth.users;

-- Update seed.sql with these IDs
```

---

## 📊 Performance Monitoring

### Queries to Watch

1. **Timeline loading** (should use `idx_itinerary_trip_time`)
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM itinerary_items 
   WHERE trip_id = '<id>' 
   ORDER BY start_time;
   ```

2. **Pie chart aggregation** (should use `idx_expenses_trip_category`)
   ```sql
   EXPLAIN ANALYZE
   SELECT category, SUM(amount) 
   FROM expenses 
   WHERE trip_id = '<id>' 
   GROUP BY category;
   ```

3. **Balance calculation** (should use `idx_splits_user_settled`)
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM expense_splits 
   WHERE user_id = '<id>' 
   AND is_settled = FALSE;
   ```

If any query shows "Seq Scan" instead of "Index Scan", add an index.

---

## ✅ Person B Checklist

- [x] Create `database/schema.sql`
- [x] Create `database/rls_policies.sql`
- [x] Create `database/seed.sql`
- [x] Create `DATABASE_SCHEMA.md`
- [x] Update `README.md` with setup instructions
- [x] Create `.env.example`
- [ ] Create Supabase project
- [ ] Run schema.sql in Supabase
- [ ] Run rls_policies.sql in Supabase
- [ ] Create 3 test users
- [ ] Update seed.sql with real user IDs
- [ ] Run seed.sql in Supabase
- [ ] Share credentials with team
- [ ] Verify all tables have data
- [ ] Test RLS policies with different users

---

## 🎉 You're Done When...

- [ ] All SQL files run without errors
- [ ] Seed data appears in Supabase dashboard
- [ ] Person A can see the schema documentation
- [ ] Person C has Supabase credentials
- [ ] Test users can log in
- [ ] RLS policies are working (users only see their trips)

---

**Questions?** Open a GitHub issue and tag @PersonB

# 🚀 Supabase Setup Guide for Person B

This guide walks you through setting up the database from scratch.

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - **Name**: `group-travel-planner`
   - **Database Password**: (save this securely)
   - **Region**: Choose closest to your team
4. Click **"Create new project"**
5. Wait 2-3 minutes for provisioning

---

## Step 2: Get Your Credentials

1. In Supabase Dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...` (long string)
3. Create `.env` file in project root:
   ```bash
   cp .env.example .env
   ```
4. Paste your credentials into `.env`

---

## Step 3: Run Schema SQL

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Open `database/schema.sql` from this repo
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **"Run"** (bottom right)
7. ✅ You should see: "Success. No rows returned"

### Verify Tables Created

1. Go to **Table Editor** in sidebar
2. You should see 5 tables:
   - `trips`
   - `trip_members`
   - `itinerary_items`
   - `expenses`
   - `expense_splits`

---

## Step 4: Run RLS Policies

1. Back in **SQL Editor**, click **"New query"**
2. Open `database/rls_policies.sql`
3. Copy entire contents
4. Paste and click **"Run"**
5. ✅ You should see: "Success. No rows returned"

### Verify RLS Enabled

1. Go to **Authentication** → **Policies**
2. Select each table from dropdown
3. You should see multiple policies per table

---

## Step 5: Create Test Users

1. Go to **Authentication** → **Users**
2. Click **"Add user"** → **"Create new user"**
3. Create 3 users:

   **User 1** (Trip Owner)
   - Email: `alice@example.com`
   - Password: `TestPass123!`
   - Auto Confirm: ✅ Yes

   **User 2** (Member)
   - Email: `bob@example.com`
   - Password: `TestPass123!`
   - Auto Confirm: ✅ Yes

   **User 3** (Member)
   - Email: `charlie@example.com`
   - Password: `TestPass123!`
   - Auto Confirm: ✅ Yes

4. **Copy their UUIDs** (you'll need these next)

---

## Step 6: Update Seed File with Real UUIDs

1. In **Authentication** → **Users**, copy each user's UUID
2. Open `database/seed.sql` in your code editor
3. Find these lines at the top:
   ```sql
   demo_user_1 UUID := '11111111-1111-1111-1111-111111111111';
   demo_user_2 UUID := '22222222-2222-2222-2222-222222222222';
   demo_user_3 UUID := '33333333-3333-3333-3333-333333333333';
   ```
4. Replace with your real UUIDs:
   ```sql
   demo_user_1 UUID := 'abc123...'; -- Alice's UUID
   demo_user_2 UUID := 'def456...'; -- Bob's UUID
   demo_user_3 UUID := 'ghi789...'; -- Charlie's UUID
   ```
5. Save the file

---

## Step 7: Run Seed Data

1. Back in **SQL Editor**, click **"New query"**
2. Open your updated `database/seed.sql`
3. Copy entire contents
4. Paste and click **"Run"**
5. ✅ You should see: "Success. No rows returned"

### Verify Data Loaded

1. Go to **Table Editor**
2. Check each table:
   - `trips`: Should have 1 row (Barcelona trip)
   - `trip_members`: Should have 3 rows
   - `itinerary_items`: Should have 12 rows
   - `expenses`: Should have 4 rows
   - `expense_splits`: Should have 12 rows

---

## Step 8: Test RLS Policies

Let's verify users can only see their own trips.

### Test 1: Alice can see the Barcelona trip

1. Go to **SQL Editor** → **New query**
2. Run this (replace with Alice's UUID):
   ```sql
   -- Simulate Alice's session
   SELECT set_config('request.jwt.claims', 
     '{"sub":"ALICE_UUID_HERE"}', true);
   
   -- Alice should see the Barcelona trip
   SELECT * FROM trips;
   ```
3. ✅ Should return 1 row

### Test 2: Random user cannot see the trip

1. Run this:
   ```sql
   -- Simulate unknown user
   SELECT set_config('request.jwt.claims', 
     '{"sub":"00000000-0000-0000-0000-000000000000"}', true);
   
   -- Should return nothing
   SELECT * FROM trips;
   ```
2. ✅ Should return 0 rows

---

## Step 9: Share with Team

Create a message for your team:

```
🎉 Database is ready!

Supabase URL: https://xxxxx.supabase.co
Anon Key: eyJhbGc... (paste in .env)

Test Users:
- alice@example.com / TestPass123!
- bob@example.com / TestPass123!
- charlie@example.com / TestPass123!

Schema docs: DATABASE_SCHEMA.md
Setup complete ✅

Person A: You can start building components with mockData
Person C: You can start building services with Supabase client
```

---

## Step 10: Commit Your Work

```bash
git checkout -b feature/database-schema
git add database/ DATABASE_SCHEMA.md README.md .env.example
git commit -m "feat: complete database schema, RLS policies, and seed data"
git push origin feature/database-schema
```

Then open a PR to `dev` branch.

---

## 🐛 Troubleshooting

### Error: "relation does not exist"

**Cause**: Schema wasn't run or failed partway through

**Fix**: 
1. Go to **SQL Editor**
2. Run: `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
3. Re-run `schema.sql`

### Error: "insert or update on table violates foreign key constraint"

**Cause**: User UUIDs in seed.sql don't match real users

**Fix**: Double-check you copied the correct UUIDs from Authentication → Users

### Error: "new row violates row-level security policy"

**Cause**: RLS policies are too restrictive or not set up correctly

**Fix**: 
1. Verify `rls_policies.sql` ran successfully
2. Check that helper functions exist:
   ```sql
   SELECT * FROM pg_proc WHERE proname = 'is_trip_member';
   ```

### Seed data shows 0 rows inserted

**Cause**: The DO block might have failed silently

**Fix**: Run each INSERT statement individually to find the error

---

## 📊 Useful Queries for Debugging

### Check all tables and row counts
```sql
SELECT 
  schemaname,
  tablename,
  (SELECT COUNT(*) FROM trips) as trips_count,
  (SELECT COUNT(*) FROM trip_members) as members_count,
  (SELECT COUNT(*) FROM itinerary_items) as itinerary_count,
  (SELECT COUNT(*) FROM expenses) as expenses_count,
  (SELECT COUNT(*) FROM expense_splits) as splits_count;
```

### View all RLS policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Check indexes
```sql
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## ✅ Final Checklist

- [ ] Supabase project created
- [ ] Schema SQL ran successfully (5 tables created)
- [ ] RLS policies SQL ran successfully
- [ ] 3 test users created in Auth
- [ ] User UUIDs copied and pasted into seed.sql
- [ ] Seed SQL ran successfully
- [ ] All tables have data (verified in Table Editor)
- [ ] RLS test passed (Alice sees trip, stranger doesn't)
- [ ] `.env` file created with credentials
- [ ] Team notified with credentials
- [ ] PR opened to `dev` branch

---

**You're done!** 🎉

Person A and Person C can now start their work.

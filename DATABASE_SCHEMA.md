# 📊 Database Schema Reference

**Author**: Person B (Database Architect)  
**Last Updated**: 2024  
**Purpose**: Source of truth for all table structures, column names, and data types

---

## 🎯 Quick Reference for Team

### Person A (Frontend Components)
- Use these **exact column names** in your mock data
- Match the `category_icon` values exactly: `'activity'`, `'food'`, `'transport'`, `'music'`, `'accommodation'`
- Match the `category` values for expenses: `'Accommodation'`, `'Food & Drinks'`, `'Activities'`, `'Transport'`

### Person C (API Services)
- All IDs are UUIDs (not integers)
- All timestamps use `TIMESTAMPTZ` (ISO 8601 format)
- All monetary amounts are `DECIMAL(10,2)`
- Foreign key relationships are enforced at the database level

---

## 📋 Table Structures

### 1. `trips`

Core trip metadata including destination and budget.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Auto-generated trip identifier |
| `name` | VARCHAR(255) | NOT NULL | Trip name (e.g., "Barcelona Summer Trip") |
| `destination` | VARCHAR(255) | NOT NULL | City/country destination |
| `start_date` | DATE | NOT NULL | Trip start date |
| `end_date` | DATE | NOT NULL | Trip end date (must be >= start_date) |
| `total_budget` | DECIMAL(10,2) | DEFAULT 0 | Planned budget in USD |
| `created_by` | UUID | FK → auth.users | User who created the trip |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Indexes:**
- Primary key on `id`

---

### 2. `trip_members`

Many-to-many relationship between users and trips.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Auto-generated member record ID |
| `trip_id` | UUID | FK → trips, NOT NULL | Trip reference |
| `user_id` | UUID | FK → auth.users, NOT NULL | User reference |
| `role` | VARCHAR(50) | DEFAULT 'member' | Either 'owner' or 'member' |
| `joined_at` | TIMESTAMPTZ | DEFAULT now() | When user joined trip |

**Constraints:**
- UNIQUE(trip_id, user_id) — prevents duplicate memberships
- `role` must be either `'owner'` or `'member'`

**Indexes:**
- `idx_trip_members_user` on `user_id`
- `idx_trip_members_trip` on `trip_id`

---

### 3. `itinerary_items`

Timeline activities for each trip (powers the vertical timeline view).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Auto-generated item ID |
| `trip_id` | UUID | FK → trips, NOT NULL | Trip reference |
| `title` | VARCHAR(255) | NOT NULL | Activity name |
| `location` | VARCHAR(255) | nullable | Address or place name |
| `start_time` | TIMESTAMPTZ | NOT NULL | Activity start (date + time) |
| `end_time` | TIMESTAMPTZ | nullable | Activity end (must be >= start_time) |
| `notes` | TEXT | nullable | Additional details |
| `category_icon` | VARCHAR(50) | DEFAULT 'activity' | Icon type (see below) |
| `created_by` | UUID | FK → auth.users | User who added this item |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Valid `category_icon` values:**
- `'activity'` — general activities
- `'food'` — meals and dining
- `'transport'` — travel/transit
- `'music'` — concerts, shows
- `'accommodation'` — hotels, check-ins

**Indexes:**
- `idx_itinerary_trip_time` on `(trip_id, start_time ASC)` — fast timeline queries

---

### 4. `expenses`

Individual bills/payments made during the trip.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Auto-generated expense ID |
| `trip_id` | UUID | FK → trips, NOT NULL | Trip reference |
| `description` | VARCHAR(255) | NOT NULL | What was purchased |
| `amount` | DECIMAL(10,2) | NOT NULL, > 0 | Total amount paid |
| `category` | VARCHAR(50) | NOT NULL | Expense category (see below) |
| `paid_by` | UUID | FK → auth.users, NOT NULL | User who paid upfront |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Valid `category` values:**
- `'Accommodation'`
- `'Food & Drinks'`
- `'Activities'`
- `'Transport'`

**Indexes:**
- `idx_expenses_trip_category` on `(trip_id, category)` — fast pie chart aggregations
- `idx_expenses_paid_by` on `paid_by`

---

### 5. `expense_splits`

How each expense is divided among trip members (powers the balance sheet).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Auto-generated split ID |
| `expense_id` | UUID | FK → expenses, NOT NULL | Expense reference |
| `user_id` | UUID | FK → auth.users, NOT NULL | User who owes this portion |
| `owed_amount` | DECIMAL(10,2) | NOT NULL, > 0 | Amount this user owes |
| `is_settled` | BOOLEAN | DEFAULT FALSE | Whether user has paid back |
| `settled_at` | TIMESTAMPTZ | nullable | When payment was settled |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |

**Constraints:**
- UNIQUE(expense_id, user_id) — one split per user per expense
- If `is_settled = TRUE`, then `settled_at` must be NOT NULL

**Indexes:**
- `idx_splits_user_settled` on `(user_id, is_settled)` — fast balance calculations
- `idx_splits_expense` on `expense_id`

---

## 🔐 Security Model (RLS)

All tables have Row Level Security enabled. Key policies:

- **Users can only view trips they're members of**
- **Trip owners** can update/delete trips and manage members
- **All members** can add itinerary items and expenses
- **Expense payers** can create/update/delete their own expenses
- **Users** can mark their own splits as settled

See `database/rls_policies.sql` for complete policy definitions.

---

## 🔗 Relationships

```
auth.users (Supabase Auth)
    ↓
    ├─→ trips.created_by
    ├─→ trip_members.user_id
    ├─→ itinerary_items.created_by
    ├─→ expenses.paid_by
    └─→ expense_splits.user_id

trips
    ↓
    ├─→ trip_members.trip_id
    ├─→ itinerary_items.trip_id
    └─→ expenses.trip_id
            ↓
            └─→ expense_splits.expense_id
```

---

## 📊 Views

### `trip_summary`

Aggregated trip statistics (member count, total spent).

```sql
SELECT * FROM trip_summary WHERE id = '<trip_id>';
```

Returns:
- All trip columns
- `member_count` — number of members
- `total_spent` — sum of all expenses

---

## 🚀 Usage Examples

### Get all itinerary items for a trip (ordered by time)

```sql
SELECT * FROM itinerary_items
WHERE trip_id = '<trip_id>'
ORDER BY start_time ASC;
```

### Get expense breakdown by category (for pie chart)

```sql
SELECT category, SUM(amount) as total
FROM expenses
WHERE trip_id = '<trip_id>'
GROUP BY category;
```

### Calculate balance for a user (who owes them vs. what they owe)

```sql
-- What others owe this user
SELECT SUM(es.owed_amount) as owed_to_me
FROM expense_splits es
JOIN expenses e ON es.expense_id = e.id
WHERE e.paid_by = '<user_id>'
  AND es.user_id != '<user_id>'
  AND es.is_settled = FALSE;

-- What this user owes others
SELECT SUM(es.owed_amount) as i_owe
FROM expense_splits es
JOIN expenses e ON es.expense_id = e.id
WHERE es.user_id = '<user_id>'
  AND e.paid_by != '<user_id>'
  AND es.is_settled = FALSE;
```

---

## 📝 Notes for Person C (API Services)

When building service functions:

1. **Always filter by `trip_id`** first for performance (uses indexes)
2. **Use parameterized queries** to prevent SQL injection
3. **Validate category values** before INSERT (use the exact strings above)
4. **Handle timezone conversions** properly (store as UTC, display in user's timezone)
5. **When creating an expense**, also create corresponding `expense_splits` records
6. **Sum of all splits** for an expense should equal the expense amount

---

## 🔄 Schema Change Protocol

If you need to modify the schema:

1. Open a PR with the SQL migration
2. Update this `DATABASE_SCHEMA.md` file
3. Tag **@PersonA** and **@PersonC** in the PR
4. Wait for confirmation before merging
5. Update `mockData/index.js` to match new structure

---

**Questions?** Tag @PersonB in GitHub issues or Slack.

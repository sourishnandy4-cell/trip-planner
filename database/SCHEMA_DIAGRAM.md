# 📊 Database Schema Diagram

## Entity Relationship Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         auth.users (Supabase)                       │
│                                                                     │
│  • id (UUID)                                                        │
│  • email                                                            │
│  • created_at                                                       │
└──────────────────────────────┬──────────────────────────────────────┘
                               │
                               │ (referenced by multiple tables)
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌───────────────┐      ┌───────────────┐     ┌──────────────┐
│    trips      │      │ trip_members  │     │  expenses    │
├───────────────┤      ├───────────────┤     ├──────────────┤
│ id (PK)       │◄─────┤ trip_id (FK)  │     │ paid_by (FK) │
│ name          │      │ user_id (FK)  │─────┤              │
│ destination   │      │ role          │     │              │
│ start_date    │      │ joined_at     │     │              │
│ end_date      │      └───────────────┘     │              │
│ total_budget  │                            │              │
│ created_by(FK)│                            │              │
└───────┬───────┘                            └──────────────┘
        │                                            │
        │                                            │
        │                                            │
        ▼                                            ▼
┌───────────────────┐                    ┌──────────────────┐
│ itinerary_items   │                    │ expense_splits   │
├───────────────────┤                    ├──────────────────┤
│ id (PK)           │                    │ id (PK)          │
│ trip_id (FK)      │                    │ expense_id (FK)  │
│ title             │                    │ user_id (FK)     │
│ location          │                    │ owed_amount      │
│ start_time        │                    │ is_settled       │
│ end_time          │                    │ settled_at       │
│ category_icon     │                    └──────────────────┘
│ created_by (FK)   │
└───────────────────┘
```

---

## Table Relationships

### 1. Users → Trips (One-to-Many)
- One user can **create** multiple trips
- `trips.created_by` → `auth.users.id`

### 2. Users ↔ Trips (Many-to-Many via trip_members)
- One user can **belong to** multiple trips
- One trip can have multiple members
- Junction table: `trip_members`

### 3. Trips → Itinerary Items (One-to-Many)
- One trip has multiple itinerary items
- `itinerary_items.trip_id` → `trips.id`
- CASCADE DELETE: deleting a trip deletes all its itinerary items

### 4. Trips → Expenses (One-to-Many)
- One trip has multiple expenses
- `expenses.trip_id` → `trips.id`
- CASCADE DELETE: deleting a trip deletes all its expenses

### 5. Users → Expenses (One-to-Many)
- One user can pay multiple expenses
- `expenses.paid_by` → `auth.users.id`
- RESTRICT DELETE: cannot delete a user who has paid expenses

### 6. Expenses → Expense Splits (One-to-Many)
- One expense is split among multiple users
- `expense_splits.expense_id` → `expenses.id`
- CASCADE DELETE: deleting an expense deletes all its splits

### 7. Users → Expense Splits (One-to-Many)
- One user can owe portions of multiple expenses
- `expense_splits.user_id` → `auth.users.id`
- CASCADE DELETE: deleting a user deletes their splits

---

## Data Flow Examples

### Creating a Trip with Members

```
1. User creates trip
   INSERT INTO trips (name, destination, ..., created_by)
   
2. System adds creator as owner
   INSERT INTO trip_members (trip_id, user_id, role='owner')
   
3. Owner invites friends
   INSERT INTO trip_members (trip_id, user_id, role='member')
```

### Adding an Expense

```
1. User pays for something
   INSERT INTO expenses (trip_id, description, amount, paid_by)
   
2. Split among members
   INSERT INTO expense_splits (expense_id, user_id, owed_amount)
   (one row per person who owes)
   
3. Members settle up
   UPDATE expense_splits SET is_settled=TRUE, settled_at=NOW()
   WHERE user_id = <payer> AND expense_id = <expense>
```

### Loading the Dashboard

```
1. Get trip summary
   SELECT * FROM trip_summary WHERE id = <trip_id>
   
2. Get timeline
   SELECT * FROM itinerary_items 
   WHERE trip_id = <trip_id> 
   ORDER BY start_time
   
3. Get expense breakdown (pie chart)
   SELECT category, SUM(amount) 
   FROM expenses 
   WHERE trip_id = <trip_id> 
   GROUP BY category
   
4. Calculate balances
   -- What others owe me
   SELECT SUM(owed_amount) FROM expense_splits es
   JOIN expenses e ON es.expense_id = e.id
   WHERE e.paid_by = <me> AND es.user_id != <me> AND NOT is_settled
   
   -- What I owe others
   SELECT SUM(owed_amount) FROM expense_splits
   WHERE user_id = <me> AND NOT is_settled
```

---

## Cardinality Summary

| Relationship | Type | Delete Behavior |
|--------------|------|-----------------|
| User → Trips (creator) | 1:N | SET NULL |
| User ↔ Trips (members) | M:N | CASCADE |
| Trip → Itinerary Items | 1:N | CASCADE |
| Trip → Expenses | 1:N | CASCADE |
| User → Expenses (payer) | 1:N | RESTRICT |
| Expense → Splits | 1:N | CASCADE |
| User → Splits (debtor) | 1:N | CASCADE |

---

## Index Strategy

### Timeline Queries
```sql
-- Index: idx_itinerary_trip_time
SELECT * FROM itinerary_items 
WHERE trip_id = ? 
ORDER BY start_time ASC;
```
**Performance**: O(log n) lookup + sequential scan of results

### Pie Chart Aggregation
```sql
-- Index: idx_expenses_trip_category
SELECT category, SUM(amount) 
FROM expenses 
WHERE trip_id = ? 
GROUP BY category;
```
**Performance**: O(log n) lookup + O(k) aggregation (k = # categories)

### Balance Calculation
```sql
-- Index: idx_splits_user_settled
SELECT SUM(owed_amount) 
FROM expense_splits 
WHERE user_id = ? AND is_settled = FALSE;
```
**Performance**: O(log n) lookup + O(m) sum (m = # unsettled splits)

---

## Security Boundaries (RLS)

```
┌─────────────────────────────────────────────────────────────┐
│                      Authenticated User                     │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ is_trip_member?│
                    └────────┬───────┘
                             │
                ┌────────────┴────────────┐
                │                         │
               YES                       NO
                │                         │
                ▼                         ▼
        ┌───────────────┐         ┌──────────┐
        │ Can view trip │         │ Blocked  │
        │ Can add items │         │ by RLS   │
        │ Can add costs │         └──────────┘
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │ is_trip_owner?│
        └───────┬───────┘
                │
        ┌───────┴────────┐
        │                │
       YES              NO
        │                │
        ▼                ▼
┌──────────────┐  ┌─────────────┐
│ Full control │  │ Limited     │
│ Update trip  │  │ Can't delete│
│ Delete trip  │  │ others' data│
│ Manage users │  └─────────────┘
└──────────────┘
```

---

## Sample Data Structure (Barcelona Trip)

```
Trip: Barcelona Summer Trip
├── Members (3)
│   ├── Alice (owner)
│   ├── Bob (member)
│   └── Charlie (member)
│
├── Itinerary (12 items)
│   ├── Day 1 (Jul 15): Airport → Hotel → Lunch → Gothic Quarter
│   ├── Day 2 (Jul 16): Sagrada → Brunch → Park Güell → Flamenco
│   ├── Day 3 (Jul 17): Beach → Dinner
│   └── Day 4 (Jul 18): Casa Batlló → Shopping
│
└── Expenses (4 items, $1,515 total)
    ├── Hotel: $1,200 (paid by Alice, split 3 ways)
    ├── Sagrada tickets: $90 (paid by Bob, split 3 ways)
    ├── Seafood dinner: $180 (paid by Charlie, split 3 ways)
    └── Airport taxi: $45 (paid by Alice, split 3 ways)
```

---

## Query Performance Expectations

| Query | Expected Time | Index Used |
|-------|---------------|------------|
| Load timeline (100 items) | <10ms | idx_itinerary_trip_time |
| Aggregate expenses (4 categories) | <5ms | idx_expenses_trip_category |
| Calculate user balance | <10ms | idx_splits_user_settled |
| Check trip membership | <5ms | idx_trip_members_user |
| List user's trips | <10ms | idx_trip_members_user |

---

## Scaling Considerations

### Current Design Supports
- ✅ 1,000+ trips
- ✅ 10,000+ users
- ✅ 100,000+ itinerary items
- ✅ 100,000+ expenses

### Future Optimizations (if needed)
- Partition `itinerary_items` by trip_id
- Add materialized view for balance calculations
- Cache trip summaries in Redis
- Archive old trips to separate table

---

This diagram should help visualize how all the pieces fit together!

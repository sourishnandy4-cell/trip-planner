# 🗄️ Database Schema (Person B)

This directory contains all Supabase database schema, policies, and seed data.

## Files to Create

### `schema.sql`
Define tables for:
- `trips` - trip metadata
- `itinerary_items` - scheduled activities
- `expenses` - expense records
- `expense_categories` - budget breakdown by category
- `balances` - settlement tracking between users

### `rls_policies.sql`
Row-level security policies for multi-user access control.

### `seed.sql`
Sample data matching the mock data structure in `src/mockData/index.js`.

## Coordination
- Review `src/mockData/index.js` for expected data shapes
- Coordinate column names with Person C (API services)
- Tag Person A if any frontend changes are needed

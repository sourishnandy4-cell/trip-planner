# 📡 API Services Layer (Person C)

This directory contains all Supabase client setup and data fetching services.

## Files to Create

### `supabaseClient.js`
Initialize and export the Supabase client using environment variables.

### `itineraryService.js`
Functions:
- `getTripMeta(tripId)` - fetch trip metadata
- `getItineraryItems(tripId)` - fetch all itinerary items for a trip

### `expenseService.js`
Functions:
- `getExpenseCategories(tripId)` - fetch budget breakdown
- `getRecentExpenses(tripId)` - fetch recent expense list
- `getBalances(tripId)` - fetch settlement balances

### `balanceCalculator.js`
Utility functions for calculating who owes whom based on expenses.

## Integration Steps
1. Wait for Person B to finalize database schema
2. Create service functions matching mock data shapes in `src/mockData/index.js`
3. Update `src/App.jsx` to use your services instead of mock imports
4. Add loading states and error handling
5. Test with Person A's components

## Data Contracts
See `src/mockData/index.js` for JSDoc type definitions your functions should return.

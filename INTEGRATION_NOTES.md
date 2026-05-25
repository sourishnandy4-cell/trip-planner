# 🔄 Integration Notes for Person C

## Current State
All frontend components are complete and working with mock data from `src/mockData/index.js`.

## Integration Checklist

### Step 1: Database Schema Confirmation (Person B)
- [ ] Confirm table structure matches mock data types
- [ ] Verify column names align with mock data properties
- [ ] Ensure RLS policies are in place

### Step 2: API Services Setup (Person C)
Create these files in `src/lib/`:

#### `src/lib/supabaseClient.js`
```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

#### `src/lib/itineraryService.js`
Replace mock exports with:
- `getTripMeta(tripId)` → returns trip metadata
- `getItineraryItems(tripId)` → returns array of itinerary items

#### `src/lib/expenseService.js`
Replace mock exports with:
- `getExpenseCategories(tripId)` → returns budget breakdown
- `getRecentExpenses(tripId)` → returns recent expense list
- `getBalances(tripId)` → returns who-owes-whom data

### Step 3: Component Updates
Search for `// TODO: swap mock data` comments in:
- `src/App.jsx` (main integration point)

Replace:
```javascript
import { TRIP_META, ITINERARY_ITEMS, ... } from './mockData';
```

With:
```javascript
import { getTripMeta, getItineraryItems } from './lib/itineraryService';
import { getExpenseCategories, getRecentExpenses, getBalances } from './lib/expenseService';
```

Then convert to async data fetching with useState/useEffect.

### Step 4: Testing
- [ ] Verify all components render with live data
- [ ] Check loading states
- [ ] Test error handling
- [ ] Confirm responsive behavior

## Data Shape Reference
See `src/mockData/index.js` for exact TypeScript-style JSDoc types that your services should return.

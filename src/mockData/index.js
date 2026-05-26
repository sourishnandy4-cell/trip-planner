// mockData/index.js
// HANDOFF NOTE for Person C:
// Replace these exports with calls from src/lib/itineraryService.js
// and src/lib/expenseService.js once Supabase is connected.

export const TRIP_META = {
  id: 'trip-001',
  name: 'Barcelona Group Trip',
  destination: 'Barcelona, Spain',
  start_date: '2025-07-12',
  end_date: '2025-07-19',
};

/** @type {Array<{id:string, start_time:string, title:string, location:string, notes:string, category_icon:string}>} */
export const ITINERARY_ITEMS = [
  { 
    id: 'i1', 
    start_time: '2025-07-12T10:00:00', 
    title: 'Sagrada Familia Tour',
    location: 'Carrer de Mallorca', 
    notes: 'Booked tickets in advance', 
    category_icon: 'activity' 
  },
  { 
    id: 'i2', 
    start_time: '2025-07-12T14:00:00', 
    title: 'Tapas Lunch at El Xampanyet',
    location: 'El Born', 
    notes: '', 
    category_icon: 'food' 
  },
  { 
    id: 'i3', 
    start_time: '2025-07-13T09:30:00', 
    title: 'Airport Bus to City Center',
    location: 'T1 Terminal', 
    notes: 'Aerobus — Line A1', 
    category_icon: 'transport' 
  },
  { 
    id: 'i4', 
    start_time: '2025-07-14T21:00:00', 
    title: 'Jazz Club Jamboree',
    location: 'Plaça Reial 17', 
    notes: 'Dress code: smart casual', 
    category_icon: 'music' 
  },
];

/** @type {Array<{id:string, category:string, amount:number}>} */
export const EXPENSE_CATEGORIES = [
  { id: 'cat1', category: 'Accommodation', amount: 1800 },
  { id: 'cat2', category: 'Food & Drinks',  amount: 950  },
  { id: 'cat3', category: 'Activities',     amount: 600  },
  { id: 'cat4', category: 'Transport',      amount: 350  },
];

export const TOTAL_BUDGET = 4500;

/** @type {Array<{id:string, description:string, amount:number, paid_by:string}>} */
export const RECENT_EXPENSES = [
  { id: 'e1', description: 'Sagrada Familia Tickets', amount: 110, paid_by: 'Sarah' },
  { id: 'e2', description: 'Hotel Vila Olímpica (3 nights)', amount: 630, paid_by: 'Mike' },
  { id: 'e3', description: 'Aerobus Passes x3', amount: 45,  paid_by: 'Chloe' },
  { id: 'e4', description: 'Dinner at Tickets Restaurant', amount: 210, paid_by: 'Sarah' },
];

/** @type {Array<{from:string, to:string, amount:number}>} */
export const BALANCES = [
  { from: 'Mike',  to: 'Sarah', amount: 84 },
  { from: 'Chloe', to: 'You',   amount: 22 },
];

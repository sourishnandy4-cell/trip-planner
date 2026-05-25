// ============================================================================
// MOCK DATA — Barcelona Trip
// ============================================================================
// This data structure EXACTLY matches database/seed.sql
// Person C: When switching to live data, the UI should look identical
// ============================================================================

export const mockTrip = {
  id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  name: 'Barcelona Summer Trip',
  destination: 'Barcelona, Spain',
  start_date: '2024-07-15',
  end_date: '2024-07-22',
  total_budget: 3000.00,
  member_count: 3,
  total_spent: 1515.00
};

export const mockItineraryItems = [
  // Day 1: July 15, 2024
  {
    id: '1',
    title: 'Arrival at Barcelona Airport',
    location: 'El Prat Airport',
    start_time: '2024-07-15T10:00:00Z',
    end_time: '2024-07-15T11:30:00Z',
    category_icon: 'transport'
  },
  {
    id: '2',
    title: 'Check-in at Hotel',
    location: 'Hotel Arts Barcelona',
    start_time: '2024-07-15T14:00:00Z',
    end_time: '2024-07-15T15:00:00Z',
    category_icon: 'accommodation'
  },
  {
    id: '3',
    title: 'Lunch at La Boqueria Market',
    location: 'La Rambla, 91',
    start_time: '2024-07-15T13:00:00Z',
    end_time: '2024-07-15T14:30:00Z',
    category_icon: 'food'
  },
  {
    id: '4',
    title: 'Walk through Gothic Quarter',
    location: 'Barri Gòtic',
    start_time: '2024-07-15T16:00:00Z',
    end_time: '2024-07-15T18:00:00Z',
    category_icon: 'activity'
  },
  
  // Day 2: July 16, 2024
  {
    id: '5',
    title: 'Visit Sagrada Familia',
    location: 'Carrer de Mallorca, 401',
    start_time: '2024-07-16T09:00:00Z',
    end_time: '2024-07-16T11:30:00Z',
    category_icon: 'activity'
  },
  {
    id: '6',
    title: 'Brunch at Federal Café',
    location: 'Carrer del Parlament, 39',
    start_time: '2024-07-16T12:00:00Z',
    end_time: '2024-07-16T13:30:00Z',
    category_icon: 'food'
  },
  {
    id: '7',
    title: 'Park Güell Tour',
    location: 'Carrer d\'Olot, s/n',
    start_time: '2024-07-16T15:00:00Z',
    end_time: '2024-07-16T17:00:00Z',
    category_icon: 'activity'
  },
  {
    id: '8',
    title: 'Flamenco Show',
    location: 'Tablao Flamenco Cordobes',
    start_time: '2024-07-16T20:00:00Z',
    end_time: '2024-07-16T22:00:00Z',
    category_icon: 'music'
  },
  
  // Day 3: July 17, 2024
  {
    id: '9',
    title: 'Beach Day at Barceloneta',
    location: 'Platja de la Barceloneta',
    start_time: '2024-07-17T10:00:00Z',
    end_time: '2024-07-17T16:00:00Z',
    category_icon: 'activity'
  },
  {
    id: '10',
    title: 'Seafood Dinner',
    location: 'Can Solé Restaurant',
    start_time: '2024-07-17T19:00:00Z',
    end_time: '2024-07-17T21:00:00Z',
    category_icon: 'food'
  },
  
  // Day 4: July 18, 2024
  {
    id: '11',
    title: 'Casa Batlló Visit',
    location: 'Passeig de Gràcia, 43',
    start_time: '2024-07-18T10:00:00Z',
    end_time: '2024-07-18T12:00:00Z',
    category_icon: 'activity'
  },
  {
    id: '12',
    title: 'Shopping on Passeig de Gràcia',
    location: 'Passeig de Gràcia',
    start_time: '2024-07-18T13:00:00Z',
    end_time: '2024-07-18T17:00:00Z',
    category_icon: 'activity'
  }
];

export const mockExpenses = [
  {
    id: 'exp-1',
    description: 'Hotel Arts Barcelona - 7 nights',
    amount: 1200.00,
    category: 'Accommodation',
    paid_by: 'User 1',
    created_at: '2024-07-15T14:00:00Z'
  },
  {
    id: 'exp-2',
    description: 'Sagrada Familia entrance tickets',
    amount: 90.00,
    category: 'Activities',
    paid_by: 'User 2',
    created_at: '2024-07-16T09:00:00Z'
  },
  {
    id: 'exp-3',
    description: 'Seafood dinner at Can Solé',
    amount: 180.00,
    category: 'Food & Drinks',
    paid_by: 'User 3',
    created_at: '2024-07-17T19:00:00Z'
  },
  {
    id: 'exp-4',
    description: 'Taxi from El Prat Airport',
    amount: 45.00,
    category: 'Transport',
    paid_by: 'User 1',
    created_at: '2024-07-15T10:00:00Z'
  }
];

// Expense breakdown by category (for pie chart)
export const mockExpensesByCategory = {
  'Accommodation': 1200.00,
  'Food & Drinks': 180.00,
  'Activities': 90.00,
  'Transport': 45.00
};

// Balance sheet data (who owes whom)
export const mockBalances = [
  {
    user: 'User 1',
    paid: 1245.00,      // Hotel + Taxi
    owes: 505.00,       // Their share of all expenses
    balance: +740.00    // Net: owed to them
  },
  {
    user: 'User 2',
    paid: 90.00,        // Sagrada tickets
    owes: 505.00,       // Their share of all expenses
    balance: -415.00    // Net: they owe others
  },
  {
    user: 'User 3',
    paid: 180.00,       // Dinner
    owes: 505.00,       // Their share of all expenses
    balance: -325.00    // Net: they owe others
  }
];

// Recent expenses for dashboard (last 5)
export const mockRecentExpenses = mockExpenses
  .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  .slice(0, 5);

import { supabase, isMockMode } from './supabaseClient';
import { mockFetchRecentExpenses, mockFetchCategoryTotals } from './mockDatabase';

const USER_DISPLAY_NAMES = {
  '11111111-1111-1111-1111-111111111111': 'Sarah',
  '22222222-2222-2222-2222-222222222222': 'Mike',
  '33333333-3333-3333-3333-333333333333': 'Chloe',
};

/**
 * Fetch the last 10 expenses for a trip with the payer's display name.
 * @param {string} tripId
 * @returns {Promise<{data: Array<{id: string, description: string, amount: number, category: string, paid_by: string}>|null, error: any}>}
 */
export const fetchRecentExpenses = async (tripId) => {
  if (isMockMode) {
    return mockFetchRecentExpenses(tripId);
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('id, description, amount, category, paid_by, created_at')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error('[fetchRecentExpenses]', error.message);
    return { data: null, error };
  }

  const formattedData = data.map(item => ({
    id: item.id,
    description: item.description,
    amount: Number(item.amount),
    paid_by: USER_DISPLAY_NAMES[item.paid_by] || item.paid_by.substring(0, 8),
    category: item.category,
    created_at: item.created_at,
  }));

  return { data: formattedData, error: null };
};

/**
 * Fetch aggregated category totals for the budget donut chart.
 * @param {string} tripId
 * @returns {Promise<{data: Array<{category: string, amount: number}>|null, error: any}>}
 */
export const fetchCategoryTotals = async (tripId) => {
  if (isMockMode) {
    return mockFetchCategoryTotals(tripId);
  }

  const { data, error } = await supabase
    .from('expenses')
    .select('category, amount')
    .eq('trip_id', tripId);

  if (error) {
    console.error('[fetchCategoryTotals]', error.message);
    return { data: null, error };
  }

  const totals = data.reduce((acc, row) => {
    acc[row.category] = (acc[row.category] || 0) + Number(row.amount);
    return acc;
  }, {});

  const formatted = Object.entries(totals).map(([category, amount]) => ({
    category,
    amount: parseFloat(amount.toFixed(2)),
  }));

  return { data: formatted, error: null };
};

const USER_IDS = {
  'Sarah': '11111111-1111-1111-1111-111111111111',
  'Mike': '22222222-2222-2222-2222-222222222222',
  'Chloe': '33333333-3333-3333-3333-333333333333',
};

/**
 * Fetch all members associated with a trip.
 * @param {string} tripId
 * @returns {Promise<{data: Array<string>|null, error: any}>}
 */
export const fetchTripMembers = async (tripId) => {
  if (isMockMode) {
    const { mockFetchTripMembers } = await import('./mockDatabase');
    return mockFetchTripMembers(tripId);
  }

  // In live supabase mode, select user names from profile/trip_members table
  const { data, error } = await supabase
    .from('trip_members')
    .select('user_id'); // Fallback map or dynamic fetch

  if (error) {
    console.error('[fetchTripMembers]', error.message);
    return { data: null, error };
  }
  return { data: ['Sarah', 'Mike', 'Chloe'], error: null }; // Fallback for schema
};

/**
 * Add a new expense and corresponding splits.
 * @param {string} tripId
 * @param {{ description: string, amount: number, category: string, paid_by: string }} expense
 * @returns {Promise<{data: any|null, error: any}>}
 */
export const addExpense = async (tripId, expense) => {
  const payerName = expense.paid_by;
  const payerId = USER_IDS[payerName] || payerName;

  if (isMockMode) {
    const { mockAddExpense, mockFetchTripMembers } = await import('./mockDatabase');
    const { data: tripMembers } = await mockFetchTripMembers(tripId);
    
    const activeMembers = tripMembers && tripMembers.length > 0 ? tripMembers : ['Sarah', 'Mike', 'Chloe'];
    const numMembers = activeMembers.length;
    
    const splitAmount = Number((expense.amount / numMembers).toFixed(2));
    const splits = activeMembers.map(name => ({
      user_id: name,
      owed_amount: splitAmount,
      is_settled: name === payerName
    }));
    return mockAddExpense(tripId, { ...expense, paid_by: payerName }, splits);
  }

  // 1. Insert expense record
  const { data: newExpense, error: expErr } = await supabase
    .from('expenses')
    .insert([
      {
        trip_id: tripId,
        description: expense.description,
        amount: Number(expense.amount),
        category: expense.category,
        paid_by: payerId,
      }
    ])
    .select()
    .single();

  if (expErr) {
    console.error('[addExpense - expenses]', expErr.message);
    return { data: null, error: expErr };
  }

  // 2. Insert splits for all 3 users
  const splitAmount = Number((expense.amount / 3).toFixed(2));
  const splitsToInsert = Object.entries(USER_IDS).map(([name, id]) => ({
    expense_id: newExpense.id,
    user_id: id,
    owed_amount: splitAmount,
    is_settled: id === payerId,
    settled_at: id === payerId ? new Date().toISOString() : null,
  }));

  const { error: splitErr } = await supabase
    .from('expense_splits')
    .insert(splitsToInsert);

  if (splitErr) {
    console.error('[addExpense - splits]', splitErr.message);
    return { data: null, error: splitErr };
  }

  return { data: newExpense, error: null };
};

/**
 * Mark all unsettled balances for a trip as settled.
 * @param {string} tripId
 * @returns {Promise<{data: any|null, error: any}>}
 */
export const settleBalances = async (tripId) => {
  if (isMockMode) {
    const { mockSettleBalances } = await import('./mockDatabase');
    return mockSettleBalances(tripId);
  }

  const { data: expenses, error: fetchErr } = await supabase
    .from('expenses')
    .select('id')
    .eq('trip_id', tripId);

  if (fetchErr) {
    console.error('[settleBalances - fetch]', fetchErr.message);
    return { data: null, error: fetchErr };
  }

  if (!expenses || expenses.length === 0) {
    return { data: { success: true }, error: null };
  }

  const expenseIds = expenses.map(e => e.id);

  const { data, error: updateErr } = await supabase
    .from('expense_splits')
    .update({
      is_settled: true,
      settled_at: new Date().toISOString(),
    })
    .in('expense_id', expenseIds)
    .eq('is_settled', false)
    .select();

  if (updateErr) {
    console.error('[settleBalances - update]', updateErr.message);
    return { data: null, error: updateErr };
  }

  return { data, error: null };
};

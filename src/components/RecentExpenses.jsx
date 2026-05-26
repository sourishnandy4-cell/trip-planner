import React, { useState, useEffect } from 'react';
import { fetchRecentExpenses, addExpense, fetchTripMembers } from '../lib/expenseService';
import { CreditCard, AlertCircle, Plus, ChevronUp, DollarSign } from 'lucide-react';

const ExpensesSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
    <div className="flex justify-between items-center mb-4">
      <div className="h-6 w-36 bg-slate-200 rounded-lg"></div>
      <div className="h-9 w-24 bg-slate-200 rounded-xl"></div>
    </div>
    <div className="space-y-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 bg-slate-200 rounded"></div>
            <div className="h-3 w-20 bg-slate-200 rounded-full"></div>
          </div>
          <div className="h-4 w-12 bg-slate-200 rounded"></div>
        </div>
      ))}
    </div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-red-100 text-center space-y-4">
    <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-full text-red-500">
      <AlertCircle className="w-6 h-6" />
    </div>
    <h3 className="text-md font-bold text-gray-900">Failed to load expenses</h3>
    <p className="text-sm text-gray-500 max-w-xs mx-auto">{message || 'Failed to load data. Try again.'}</p>
    <button 
      onClick={onRetry}
      className="bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200"
    >
      Try Again
    </button>
  </div>
);

export const RecentExpenses = ({ tripId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', refreshTrigger, expenses: initialExpenses, onRefresh, currencySymbol = '₹' }) => {
  const [expenses, setExpenses] = useState(initialExpenses || null);
  const [loading, setLoading] = useState(!initialExpenses);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  // members is now an array of { id, name } objects
  const [members, setMembers] = useState([]);

  // Form State
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Accommodation');
  const [paidBy, setPaidBy] = useState(''); // stores member id
  const [submitting, setSubmitting] = useState(false);

  const loadExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await fetchRecentExpenses(tripId);
      if (fetchErr) {
        setError(fetchErr.message || 'Failed to load recent expenses.');
      } else {
        setExpenses(data);
      }
    } catch (err) {
      setError('An unexpected error occurred while loading recent expenses.');
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    try {
      const { data } = await fetchTripMembers(tripId);
      if (data && data.length > 0) {
        setMembers(data);
        // Set default paidBy to first member id if not set
        setPaidBy(prev => {
          const ids = data.map(m => m.id);
          return ids.includes(prev) ? prev : data[0].id;
        });
      }
    } catch (err) {
      console.error('Failed to load trip members:', err);
    }
  };

  useEffect(() => {
    if (!initialExpenses) {
      loadExpenses();
    }
    loadMembers();
  }, [tripId, initialExpenses, refreshTrigger]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description || !amount || Number(amount) <= 0) return;

    setSubmitting(true);
    try {
      const { error: addErr } = await addExpense(tripId, {
        description,
        amount: parseFloat(amount),
        category,
        paid_by: paidBy
      });

      if (addErr) {
        alert('Failed to save expense: ' + addErr.message);
      } else {
        setDescription('');
        setAmount('');
        setCategory('Accommodation');
        setPaidBy(members.length > 0 ? members[0].id : '');
        setShowAddForm(false);
        await loadExpenses();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert('An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <ExpensesSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadExpenses} />;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Recent Expenses</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1.5 bg-[#E8A87C] hover:bg-[#d8976b] text-white font-bold text-xs rounded-xl px-3 py-1.5 hover:shadow-md transition-all duration-200"
        >
          {showAddForm ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" /> Cancel
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" /> Add
            </>
          )}
        </button>
      </div>

      {/* Add Expense Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-gray-100 rounded-xl p-4 space-y-4 hover:shadow-md transition-all duration-200">
          <h3 className="font-bold text-primary text-sm">Add New Expense</h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Description *</label>
              <input
                type="text"
                required
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g. Group dinner at Can Solé"
                className="w-full text-sm rounded-lg border-gray-200 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-[#E8A87C] focus:border-transparent bg-white text-gray-800"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Amount ({currencySymbol}) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-sm rounded-lg border-gray-200 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-[#E8A87C] focus:border-transparent bg-white text-gray-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full text-sm rounded-lg border-gray-200 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-[#E8A87C] focus:border-transparent bg-white text-gray-800"
                >
                  <option value="Accommodation">Accommodation</option>
                  <option value="Food & Drinks">Food & Drinks</option>
                  <option value="Activities">Activities</option>
                  <option value="Transport">Transport</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Paid By (Payer)</label>
              <select
                value={paidBy}
                onChange={e => setPaidBy(e.target.value)}
                className="w-full text-sm rounded-lg border-gray-200 px-3 py-2 border focus:outline-none focus:ring-2 focus:ring-[#E8A87C] focus:border-transparent bg-white text-gray-800"
              >
                {members.length > 0 ? (
                  members.map(member => (
                    <option key={member.id} value={member.id}>{member.name}</option>
                  ))
                ) : (
                  <option value="">Loading members...</option>
                )}
              </select>
            </div>
            
            <p className="text-[10px] text-gray-400 italic">
              Note: This expense will automatically split equally among {members.length > 0 ? `${members.length} trip member${members.length > 1 ? 's' : ''}` : 'all trip members'}.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary hover:bg-primary/95 text-white font-bold rounded-xl px-4 py-2 text-sm flex items-center justify-center gap-2 hover:shadow-lg transition-all duration-200 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Expense'}
          </button>
        </form>
      )}

      {(!expenses || expenses.length === 0) ? (
        <div className="bg-slate-50 border border-dashed border-gray-200 rounded-2xl p-6 text-center text-gray-500 py-8">
          <CreditCard className="w-8 h-8 mx-auto text-gray-300 mb-2" />
          <h3 className="font-bold text-gray-700 text-sm">No Expenses</h3>
          <p className="text-xs text-gray-400">Click "Add" above to create one.</p>
        </div>
      ) : (
        <div className="max-h-[300px] overflow-y-auto pr-1">
          <div className="space-y-1">
            {expenses.map((expense, index) => (
              <div
                key={expense.id}
                className={`
                  flex items-center justify-between p-3 rounded-lg
                  ${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}
                  hover:bg-slate-100 transition-all duration-200
                `}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{expense.description}</div>
                  <div className="text-[10px] text-gray-500 mt-1 flex gap-2">
                    <span className="inline-block px-2 py-0.5 bg-gray-200 rounded-full font-medium">
                      Paid by {expense.paid_by}
                    </span>
                    <span className="inline-block px-2 py-0.5 bg-[#2E3F5C]/10 text-[#2E3F5C] rounded-full font-medium">
                      {expense.category}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-sm text-primary font-sans">
                    {currencySymbol}{Number(expense.amount).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import { calculateNetBalances } from '../lib/balanceCalculator';
import { settleBalances } from '../lib/expenseService';

const BalanceSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
    <div className="h-6 w-36 bg-slate-200 rounded-lg mb-4"></div>
    <div className="space-y-3 mb-6">
      {[1, 2].map((i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg">
          <div className="flex items-center gap-2 flex-1">
            <div className="h-4 w-12 bg-slate-200 rounded"></div>
            <div className="w-4 h-4 bg-slate-200 rounded"></div>
            <div className="h-4 w-12 bg-slate-200 rounded"></div>
          </div>
          <div className="h-4 w-12 bg-slate-200 rounded"></div>
        </div>
      ))}
    </div>
    <div className="h-12 w-full bg-slate-100 rounded-xl"></div>
  </div>
);

const ErrorState = ({ message, onRetry }) => (
  <div className="bg-white rounded-2xl shadow-sm p-6 border border-red-100 text-center space-y-4">
    <div className="inline-flex items-center justify-center p-3 bg-red-50 rounded-full text-red-500">
      <AlertCircle className="w-6 h-6" />
    </div>
    <h3 className="text-md font-bold text-gray-900">Failed to load balances</h3>
    <p className="text-sm text-gray-500 max-w-xs mx-auto">{message || 'Failed to load data. Try again.'}</p>
    <button 
      onClick={onRetry}
      className="bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200"
    >
      Try Again
    </button>
  </div>
);

export const BalanceSheet = ({ tripId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', refreshTrigger, balances: initialBalances, onRefresh, currencySymbol = '₹' }) => {
  const [balances, setBalances] = useState(initialBalances || null);
  const [loading, setLoading] = useState(!initialBalances);
  const [error, setError] = useState(null);
  const [settling, setSettling] = useState(false);

  const loadBalances = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await calculateNetBalances(tripId);
      if (fetchErr) {
        setError(fetchErr.message || 'Failed to load net balances.');
      } else {
        setBalances(data);
      }
    } catch (err) {
      setError('An unexpected error occurred while calculating balances.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialBalances) {
      loadBalances();
    }
  }, [tripId, initialBalances, refreshTrigger]);

  const handleSettleUp = async () => {
    if (!balances || balances.length === 0 || settling) return;

    setSettling(true);
    try {
      const { error: settleErr } = await settleBalances(tripId);
      if (settleErr) {
        alert('Failed to settle balances: ' + settleErr.message);
      } else {
        await loadBalances();
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      alert('An unexpected error occurred during settlement.');
    } finally {
      setSettling(false);
    }
  };

  if (loading) return <BalanceSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadBalances} />;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-bold text-primary">Balance Sheet</h2>
      
      {balances && balances.length > 0 ? (
        <>
          <div className="space-y-3 mb-2 pr-1 max-h-[220px] overflow-y-auto">
            {balances.map((balance, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all duration-200"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium text-sm text-gray-700">{balance.from}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-medium text-sm text-gray-700">{balance.to}</span>
                </div>
                
                <div className="font-bold text-sm text-red-600 font-sans">
                  {currencySymbol}{Number(balance.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Settle Up Button */}
          <button
            onClick={handleSettleUp}
            disabled={settling}
            className="w-full bg-accent text-white font-bold rounded-xl px-6 py-3 hover:bg-accent/90 hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {settling ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Settling Balances...
              </>
            ) : (
              'SETTLE UP'
            )}
          </button>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500 mb-2 flex flex-col items-center justify-center gap-2 bg-slate-50 rounded-xl border border-gray-100 p-4">
          <Sparkles className="w-8 h-8 text-yellow-500 animate-bounce" />
          <p className="font-bold text-gray-700 text-sm">All settled up!</p>
          <p className="text-xs text-gray-400">No active debts between members.</p>
        </div>
      )}
    </div>
  );
};

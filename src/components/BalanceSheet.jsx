import React from 'react';
import { ArrowRight } from 'lucide-react';

export const BalanceSheet = ({ balances }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-primary mb-4">Balance Sheet</h2>
      
      <div className="space-y-3 mb-6">
        {balances.map((balance, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all duration-200"
          >
            <div className="flex items-center gap-2 flex-1">
              <span className="font-medium text-gray-700">{balance.from}</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
              <span className="font-medium text-gray-700">{balance.to}</span>
            </div>
            
            <div className="font-bold text-red-600">
              €{balance.amount.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {balances.length === 0 && (
        <div className="text-center py-6 text-gray-500 mb-6">
          All settled up! 🎉
        </div>
      )}

      {/* Settle Up Button */}
      <button className="w-full bg-accent text-white font-bold rounded-xl px-6 py-3 hover:bg-accent/90 hover:shadow-lg transition-all duration-200">
        SETTLE UP
      </button>
    </div>
  );
};

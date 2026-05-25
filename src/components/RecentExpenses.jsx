import React from 'react';

export const RecentExpenses = ({ expenses }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-primary mb-4">Recent Expenses</h2>
      
      <div className="max-h-[300px] overflow-y-auto">
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
                <div className="font-medium text-gray-900">{expense.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  <span className="inline-block px-2 py-0.5 bg-gray-200 rounded-full">
                    Paid by {expense.paid_by}
                  </span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-primary">
                  €{expense.amount.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {expenses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No expenses recorded yet
        </div>
      )}
    </div>
  );
};

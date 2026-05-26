import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { fetchCategoryTotals } from '../lib/expenseService';
import { AlertCircle } from 'lucide-react';

const COLORS = {
  'Accommodation': '#2E3F5C',
  'Food & Drinks': '#E8A87C',
  'Activities': '#6DB8A8',
  'Transport': '#C4B5D0',
};

const BudgetSkeleton = () => (
  <div className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
    <div className="h-6 w-36 bg-slate-200 rounded-lg mb-6"></div>
    <div className="flex justify-center items-center h-48 mb-6">
      <div className="w-36 h-36 rounded-full border-[16px] border-slate-100 flex items-center justify-center">
        <div className="space-y-2 text-center flex flex-col items-center">
          <div className="h-5 w-16 bg-slate-200 rounded"></div>
          <div className="h-3 w-20 bg-slate-200 rounded"></div>
        </div>
      </div>
    </div>
    <div className="space-y-3 mt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
            <div className="h-4 w-24 bg-slate-200 rounded"></div>
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
    <h3 className="text-md font-bold text-gray-900">Failed to load budget</h3>
    <p className="text-sm text-gray-500 max-w-xs mx-auto">{message || 'Failed to load data. Try again.'}</p>
    <button 
      onClick={onRetry}
      className="bg-accent/10 hover:bg-accent/20 text-accent font-semibold text-sm px-4 py-2 rounded-lg transition-colors duration-200"
    >
      Try Again
    </button>
  </div>
);

export const BudgetPieChart = ({ tripId = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', refreshTrigger, totalBudget = 3000, categories: initialCategories, currencySymbol = '₹' }) => {
  const [categories, setCategories] = useState(initialCategories || null);
  const [loading, setLoading] = useState(!initialCategories);
  const [error, setError] = useState(null);

  const loadCategoryTotals = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await fetchCategoryTotals(tripId);
      if (fetchErr) {
        setError(fetchErr.message || 'Failed to load budget overview.');
      } else {
        setCategories(data);
      }
    } catch (err) {
      setError('An unexpected error occurred while loading budget chart.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialCategories) {
      loadCategoryTotals();
    }
  }, [tripId, initialCategories, refreshTrigger]);

  if (loading) return <BudgetSkeleton />;
  if (error) return <ErrorState message={error} onRetry={loadCategoryTotals} />;
  if (!categories || categories.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center text-gray-500 py-12">
        <AlertCircle className="w-10 h-10 mx-auto text-gray-300 mb-2" />
        <h3 className="font-bold text-gray-700">No Expenses Yet</h3>
        <p className="text-sm text-gray-400">Total budget: {currencySymbol}{totalBudget.toLocaleString()}</p>
      </div>
    );
  }

  const chartData = categories.map(cat => ({
    name: cat.category,
    value: Number(cat.amount),
  }));

  const renderCustomLabel = ({ cx, cy }) => {
    return (
      <g>
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-2xl font-bold fill-primary font-sans"
        >
          {currencySymbol}{totalBudget.toLocaleString()}
        </text>
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-xs fill-gray-500 font-sans"
        >
          Total Budget
        </text>
      </g>
    );
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-col gap-2 mt-4">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              ></div>
              <span className="text-sm text-gray-700">{entry.value}</span>
            </div>
            <span className="text-sm font-bold text-primary font-sans">
              {currencySymbol}{entry.payload.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-primary mb-4">Budget Overview</h2>
      
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={renderCustomLabel}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#CBD5E1'} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <CustomLegend payload={chartData.map((item, index) => ({
        value: item.name,
        color: COLORS[item.name] || '#CBD5E1',
        payload: item,
      }))} />
    </div>
  );
};

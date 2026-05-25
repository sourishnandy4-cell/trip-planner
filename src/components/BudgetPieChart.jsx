import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const COLORS = {
  'Accommodation': '#2E3F5C',
  'Food & Drinks': '#E8A87C',
  'Activities': '#6DB8A8',
  'Transport': '#C4B5D0',
};

export const BudgetPieChart = ({ totalBudget, categories }) => {
  const chartData = categories.map(cat => ({
    name: cat.category,
    value: cat.amount,
  }));

  const renderCustomLabel = ({ cx, cy }) => {
    return (
      <g>
        <text
          x={cx}
          y={cy - 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-3xl font-bold fill-primary"
        >
          €{totalBudget.toLocaleString()}
        </text>
        <text
          x={cx}
          y={cy + 15}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-sm fill-gray-500"
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
            <span className="text-sm font-bold text-primary">
              €{entry.payload.value.toLocaleString()}
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
              <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      <CustomLegend payload={chartData.map((item, index) => ({
        value: item.name,
        color: COLORS[item.name],
        payload: item,
      }))} />
    </div>
  );
};

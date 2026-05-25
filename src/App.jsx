import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ItineraryTimeline } from './components/ItineraryTimeline';
import { BudgetPieChart } from './components/BudgetPieChart';
import { RecentExpenses } from './components/RecentExpenses';
import { BalanceSheet } from './components/BalanceSheet';

// TODO: swap mock data - Replace with imports from src/lib/ once Person C completes API services
import {
  TRIP_META,
  ITINERARY_ITEMS,
  EXPENSE_CATEGORIES,
  TOTAL_BUDGET,
  RECENT_EXPENSES,
  BALANCES,
} from './mockData';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  // Format date range for header
  const dateRange = `${new Date(TRIP_META.start_date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })} – ${new Date(TRIP_META.end_date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  })}`;

  return (
    <div className="min-h-screen bg-warm-bg">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="md:ml-64 min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <Header 
            tripName={TRIP_META.name}
            dateRange={dateRange}
            user={{ name: 'Sarah J.', initials: 'SJ' }}
          />

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Itinerary (spans 2 columns on large screens) */}
            <div className="lg:col-span-2">
              <ItineraryTimeline items={ITINERARY_ITEMS} />
            </div>

            {/* Right Column - Budget & Expenses */}
            <div className="space-y-6">
              <BudgetPieChart 
                totalBudget={TOTAL_BUDGET}
                categories={EXPENSE_CATEGORIES}
              />
              
              <RecentExpenses expenses={RECENT_EXPENSES} />
              
              <BalanceSheet balances={BALANCES} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

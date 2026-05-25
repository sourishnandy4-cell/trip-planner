import React, { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';

export const Header = ({ tripName, dateRange, user }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white shadow-sm rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Trip Info */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-primary">{tripName}</h1>
            <span className="inline-block mt-1 px-3 py-1 bg-accent/10 text-accent text-sm font-medium rounded-full">
              {dateRange}
            </span>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="hidden lg:flex flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search activities, expenses..."
              className="w-full pl-12 pr-4 py-2.5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all duration-200"
            />
          </div>
        </div>

        {/* Right: Notifications & User */}
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <button className="relative p-2 hover:bg-gray-100 rounded-full transition-all duration-200">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-xl px-3 py-2 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center font-bold text-white text-sm">
                {user?.initials || 'SJ'}
              </div>
              <span className="hidden md:block font-medium text-gray-700">
                {user?.name || 'Sarah J.'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-all duration-200">
                  Settings
                </button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-600 transition-all duration-200">
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

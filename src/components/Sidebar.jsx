import React from 'react';
import { LayoutDashboard, MapPin, Receipt, FileText, LogOut, Plane } from 'lucide-react';

export const Sidebar = ({ activeTab = 'dashboard', onTabChange }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'itinerary', label: 'Itinerary', icon: MapPin },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'docs', label: 'Docs', icon: FileText },
  ];

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-primary text-white fixed left-0 top-0 h-screen">
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <Plane className="w-8 h-8" />
        <span className="text-2xl font-bold">Wandr</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange?.(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-200
                ${isActive 
                  ? 'bg-white/10 text-white' 
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center font-bold text-primary">
            SJ
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">Sarah J.</div>
            <div className="text-xs text-white/60">Trip Organizer</div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

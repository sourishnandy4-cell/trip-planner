import React, { useState } from 'react';
import { Search, Bell, ChevronDown, BellOff, UserPlus, Menu } from 'lucide-react';

export const Header = ({ tripId, tripName, dateRange, user, onLogout, onSwitchTrip, onProfileClick, onMenuClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const hasUnread = notifications.some(n => n.unread);

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <header className="bg-white shadow-sm rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Mobile Menu + Trip Info */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-primary">{tripName}</h1>
            <span className="inline-block mt-1 px-3 py-1 bg-accent/10 text-accent text-xs md:text-sm font-medium rounded-full">
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
          {/* Invite Button */}
          <button
            onClick={() => {
              const url = `${window.location.origin}${window.location.pathname}?invite=${tripId}`;
              navigator.clipboard.writeText(url);
              alert('Invite link copied to clipboard!');
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-accent/10 hover:bg-accent/20 text-accent font-bold rounded-lg transition-colors duration-200"
            title="Invite Friends"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden md:inline text-sm">Invite</span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowDropdown(false);
              }}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-all duration-200"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown Menu */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-150 py-3.5 z-50 animate-fadeIn text-left font-sans">
                <div className="flex items-center justify-between px-4 pb-2 border-b border-gray-100 mb-1">
                  <span className="font-extrabold text-sm text-primary tracking-tight">Trip Alerts</span>
                  {notifications.length > 0 && (
                    <div className="flex gap-2 text-[10px] font-bold text-accent">
                      <button onClick={handleMarkAllRead} className="hover:underline">Mark all read</button>
                      <span>•</span>
                      <button onClick={handleClearAll} className="hover:text-red-500">Clear</button>
                    </div>
                  )}
                </div>

                <div className="max-h-[260px] overflow-y-auto divide-y divide-gray-50">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-gray-400 space-y-1.5 px-4 flex flex-col items-center">
                      <BellOff className="w-7 h-7 text-gray-300 mb-1" />
                      <h4 className="font-bold text-xs text-primary">All Caught Up!</h4>
                      <p className="text-[10px] text-gray-400 font-medium">No active alerts for this journey.</p>
                    </div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        onClick={() => handleToggleRead(n.id)}
                        className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex gap-3 relative ${
                          n.unread ? 'bg-slate-50/50' : ''
                        }`}
                      >
                        {n.unread && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-500 rounded-full ring-2 ring-white"></span>
                        )}
                        <div className="flex-1 min-w-0 pl-1.5">
                          <div className="flex justify-between items-start gap-1">
                            <h4 className={`text-xs truncate font-extrabold text-primary tracking-tight ${n.unread ? 'text-primary' : 'text-gray-600 font-bold'}`}>
                              {n.title}
                            </h4>
                            <span className="text-[9px] text-gray-400 font-bold flex-shrink-0">{n.time}</span>
                          </div>
                          <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5 truncate font-medium max-w-full">
                            {n.text}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowDropdown(!showDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 hover:bg-gray-100 rounded-xl px-3 py-2 transition-all duration-200"
            >
              {user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-8 h-8 rounded-full object-cover shadow-sm flex-shrink-0"
                />
              ) : (
                <div className={`w-8 h-8 rounded-full ${user?.avatarColorClass || 'bg-accent'} flex items-center justify-center font-bold text-white text-sm flex-shrink-0`}>
                  {user?.initials || 'SJ'}
                </div>
              )}
              <span className="hidden md:block font-medium text-gray-700">
                {user?.name || 'Sarah J.'}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {/* Dropdown Menu */}
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    if (onProfileClick) onProfileClick();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-accent font-bold transition-all duration-200"
                >
                  Customize Profile
                </button>
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    if (onSwitchTrip) onSwitchTrip();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 font-medium text-gray-700 transition-all duration-200"
                >
                  Switch / New Trip
                </button>
                <button 
                  onClick={() => {
                    setShowDropdown(false);
                    if (onLogout) onLogout();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 text-red-650 font-medium transition-all duration-200"
                >
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

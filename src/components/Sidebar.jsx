import React from 'react';
import { LayoutDashboard, MapPin, Receipt, FileText, LogOut, Plane, Bot, Users, X } from 'lucide-react';

export const Sidebar = ({ activeTab = 'dashboard', onTabChange, user, onLogout, onProfileClick, isOpen, onClose }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'itinerary', label: 'Itinerary', icon: MapPin },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'members', label: 'Members', icon: Users },
    { id: 'docs', label: 'Docs', icon: FileText },
    { id: 'ai', label: 'Finance AI', icon: Bot },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-primary text-white z-50
        transform transition-transform duration-300 ease-in-out
        md:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        {/* Logo + Close Button */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plane className="w-8 h-8" />
            <span className="text-2xl font-bold">Wandr</span>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-white/10 rounded-lg transition-all duration-200"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange?.(item.id);
                onClose?.(); // Close mobile menu after selection
              }}
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
          <div 
            onClick={onProfileClick}
            className="flex items-center gap-3 flex-1 min-w-0 hover:bg-white/5 p-1.5 rounded-xl cursor-pointer transition-all duration-200"
            title="Customize Profile"
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-10 h-10 rounded-full object-cover shadow-sm flex-shrink-0"
              />
            ) : (
              <div className={`w-10 h-10 rounded-full ${user?.avatarColorClass || 'bg-accent'} flex items-center justify-center font-bold text-white text-sm shadow-sm flex-shrink-0`}>
                {user?.initials || 'SJ'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm truncate">{user?.name || 'Sarah J.'}</div>
              <div className="text-[10px] text-white/60 truncate">{user?.role || 'Trip Organizer'}</div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 text-white/80 hover:text-white flex-shrink-0"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};

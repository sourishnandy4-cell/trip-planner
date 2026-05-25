import React from 'react';
import { Bus, Utensils, MapPin, Music } from 'lucide-react';

const iconMap = {
  transport: Bus,
  food: Utensils,
  activity: MapPin,
  music: Music,
};

export const ItineraryTimeline = ({ items }) => {
  // Group items by date
  const groupedByDate = items.reduce((acc, item) => {
    const date = new Date(item.start_time).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {});

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-bold text-primary mb-6">Itinerary Timeline</h2>
      
      <div className="space-y-8">
        {Object.entries(groupedByDate).map(([date, dayItems]) => (
          <div key={date} className="relative">
            {/* Date Label */}
            <div className="flex items-start gap-4">
              <div className="w-24 flex-shrink-0">
                <div className="text-sm font-bold text-primary">{date}</div>
              </div>

              {/* Timeline Line & Activities */}
              <div className="flex-1 relative">
                <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                
                <div className="space-y-4">
                  {dayItems.map((item) => {
                    const Icon = iconMap[item.category_icon] || MapPin;
                    const time = new Date(item.start_time).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });

                    return (
                      <div
                        key={item.id}
                        className="relative pl-8 group"
                      >
                        {/* Timeline Dot */}
                        <div className="absolute left-0 top-2 w-3 h-3 bg-accent rounded-full -translate-x-[5px] ring-4 ring-white"></div>

                        {/* Activity Card */}
                        <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-accent/10 rounded-lg">
                              <Icon className="w-5 h-5 text-accent" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-500">{time}</span>
                              </div>
                              <h3 className="font-bold text-primary mb-1">{item.title}</h3>
                              <p className="text-sm text-gray-600">{item.location}</p>
                              {item.notes && (
                                <p className="text-xs text-gray-500 mt-2 italic">{item.notes}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

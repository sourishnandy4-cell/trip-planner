import React, { useState, useEffect } from 'react';
import { FileText, CheckSquare, Plus, Trash2, ClipboardList, Briefcase, Ticket, Hotel, Sparkles, FilePlus, Check } from 'lucide-react';

export const TravelDocs = ({ tripId }) => {
  const [activeSection, setActiveSection] = useState('notes'); // 'notes' or 'packing'
  const [notes, setNotes] = useState([]);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('general'); // 'general', 'ticket', 'accommodation'
  
  const [packingItems, setPackingItems] = useState([]);
  const [newPackingText, setNewPackingText] = useState('');
  const [newPackingCategory, setNewPackingCategory] = useState('Essentials');

  const packingCategories = ['Essentials', 'Clothing', 'Electronics', 'Toiletries', 'Others'];

  // Load from localStorage on mount/trip change
  useEffect(() => {
    if (!tripId) return;
    
    const savedNotes = localStorage.getItem(`wandr_notes_${tripId}`);
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    } else {
      // Default placeholder notes
      setNotes([
        {
          id: 'note-1',
          title: 'Emergency Contact Numbers',
          content: 'Local police: 112\nEmbassy details: +34 917 848 400\nHotel Desk: +34 930 000 000',
          category: 'general',
          date: new Date().toLocaleDateString()
        },
        {
          id: 'note-2',
          title: 'Flight Booking Reference',
          content: 'Airline: Iberia (IB3014)\nConfirmation Code: Z8Y8XP\nDeparting: 10:45 AM',
          category: 'ticket',
          date: new Date().toLocaleDateString()
        }
      ]);
    }

    const savedPacking = localStorage.getItem(`wandr_packing_${tripId}`);
    if (savedPacking) {
      setPackingItems(JSON.parse(savedPacking));
    } else {
      // Default checklist items
      setPackingItems([
        { id: 'p-1', text: 'Passport and Visa documents', category: 'Essentials', checked: true },
        { id: 'p-2', text: 'Physical plane tickets / Boarding passes', category: 'Essentials', checked: false },
        { id: 'p-3', text: 'Universal power adapter', category: 'Electronics', checked: false },
        { id: 'p-4', text: 'Noise-canceling headphones', category: 'Electronics', checked: true },
        { id: 'p-5', text: 'Comfortable walking sneakers', category: 'Clothing', checked: false },
        { id: 'p-6', text: 'Toothbrush and travel-sized toothpaste', category: 'Toiletries', checked: false }
      ]);
    }
  }, [tripId]);

  // Sync state changes to localStorage
  const saveNotes = (updatedNotes) => {
    setNotes(updatedNotes);
    localStorage.setItem(`wandr_notes_${tripId}`, JSON.stringify(updatedNotes));
  };

  const savePacking = (updatedPacking) => {
    setPackingItems(updatedPacking);
    localStorage.setItem(`wandr_packing_${tripId}`, JSON.stringify(updatedPacking));
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const note = {
      id: 'note-' + Date.now(),
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      category: newNoteCategory,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    saveNotes([note, ...notes]);
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteCategory('general');
  };

  const handleDeleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    saveNotes(updated);
  };

  const handleAddPacking = (e) => {
    e.preventDefault();
    if (!newPackingText.trim()) return;

    const item = {
      id: 'p-' + Date.now(),
      text: newPackingText.trim(),
      category: newPackingCategory,
      checked: false
    };

    savePacking([...packingItems, item]);
    setNewPackingText('');
  };

  const togglePackingItem = (id) => {
    const updated = packingItems.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    savePacking(updated);
  };

  const handleDeletePacking = (id) => {
    const updated = packingItems.filter(item => item.id !== id);
    savePacking(updated);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'ticket':
        return <Ticket className="w-4 h-4 text-accent" />;
      case 'accommodation':
        return <Hotel className="w-4 h-4 text-emerald-500" />;
      default:
        return <FileText className="w-4 h-4 text-primary/60" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100/50 p-6 md:p-8 space-y-6 animate-fadeIn font-sans">
      
      {/* Header and Toggle Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/15 text-accent text-xs font-bold rounded-full">
            <Sparkles className="w-3 h-3" /> Trip Docs & Essentials
          </div>
          <h2 className="text-2xl font-extrabold text-primary tracking-tight">Travel Documents</h2>
        </div>

        {/* Toggle Controls */}
        <div className="flex bg-slate-50 border border-slate-100 p-1.5 rounded-2xl w-full sm:w-auto">
          <button
            onClick={() => setActiveSection('notes')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeSection === 'notes'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-500 hover:text-primary hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Trip Notes & Tickets</span>
          </button>
          <button
            onClick={() => setActiveSection('packing')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-xl transition-all duration-200 ${
              activeSection === 'packing'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-500 hover:text-primary hover:bg-slate-100'
            }`}
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Packing Checklist</span>
          </button>
        </div>
      </div>

      {/* TRIP NOTES & TICKETS SECTION */}
      {activeSection === 'notes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Note Form (Left/Top) */}
          <div className="lg:col-span-1 bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4 shadow-inner">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
              <FilePlus className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-primary text-sm">Add Quick Note / Doc</h3>
            </div>
            
            <form onSubmit={handleAddNote} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Title *</label>
                <input
                  type="text"
                  required
                  value={newNoteTitle}
                  onChange={e => setNewNoteTitle(e.target.value)}
                  placeholder="e.g. Hotel Check-in Details"
                  className="w-full text-xs rounded-xl border-gray-200 px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-[#E8A87C] focus:border-transparent bg-white text-gray-800 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                <select
                  value={newNoteCategory}
                  onChange={e => setNewNoteCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border-gray-200 px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-[#E8A87C] focus:border-transparent bg-white text-gray-800 transition-all"
                >
                  <option value="general">General Notes / Contacts</option>
                  <option value="ticket">Flights & Tickets</option>
                  <option value="accommodation">Accommodation & Bookings</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Content *</label>
                <textarea
                  required
                  rows="4"
                  value={newNoteContent}
                  onChange={e => setNewNoteContent(e.target.value)}
                  placeholder="Paste tickets references, addresses, or booking codes here..."
                  className="w-full text-xs rounded-xl border-gray-200 px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-[#E8A87C] focus:border-transparent bg-white text-gray-800 transition-all font-sans resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white font-bold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 hover:shadow transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5" /> Save Note
              </button>
            </form>
          </div>

          {/* Notes List (Right/Bottom) */}
          <div className="lg:col-span-2 space-y-4">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-gray-200 rounded-2xl text-center space-y-2">
                <FileText className="w-10 h-10 text-gray-300" />
                <h4 className="font-bold text-sm text-primary">No Notes Added Yet</h4>
                <p className="text-xs text-gray-400 max-w-xs">Store confirmation numbers, boarding details, and key addresses directly within Wandr.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map((note) => (
                  <div 
                    key={note.id} 
                    className="bg-white border border-gray-150 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition-shadow relative group"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-slate-50 border border-slate-100 rounded-lg">
                            {getCategoryIcon(note.category)}
                          </div>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{note.category}</span>
                        </div>
                        
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="font-extrabold text-sm text-primary tracking-tight">{note.title}</h4>
                      <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line font-medium">{note.content}</p>
                    </div>

                    <div className="border-t border-gray-50 pt-2.5 mt-3 flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-bold">{note.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* PACKING CHECKLIST SECTION */}
      {activeSection === 'packing' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Packing Form (Left/Top) */}
          <div className="lg:col-span-1 bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4 shadow-inner">
            <div className="flex items-center gap-2 pb-1 border-b border-gray-200">
              <Briefcase className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-primary text-sm">Add Packing Item</h3>
            </div>
            
            <form onSubmit={handleAddPacking} className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Item Description *</label>
                <input
                  type="text"
                  required
                  value={newPackingText}
                  onChange={e => setNewPackingText(e.target.value)}
                  placeholder="e.g. Toiletries travel bag"
                  className="w-full text-xs rounded-xl border-gray-200 px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-[#E8A87C] focus:border-transparent bg-white text-gray-800 transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Category</label>
                <select
                  value={newPackingCategory}
                  onChange={e => setNewPackingCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border-gray-200 px-3.5 py-2.5 border focus:outline-none focus:ring-2 focus:ring-[#E8A87C] focus:border-transparent bg-white text-gray-800 transition-all"
                >
                  {packingCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-[#E8A87C] hover:bg-[#d8976b] text-white font-bold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 hover:shadow transition-all duration-200"
              >
                <Plus className="w-3.5 h-3.5" /> Add to Checklist
              </button>
            </form>
            
            {/* Quick stats indicator */}
            <div className="bg-white border border-gray-150 rounded-xl p-3 text-center space-y-1.5">
              <span className="text-[10px] font-extrabold text-gray-450 uppercase tracking-wider">Checklist Progress</span>
              <div className="text-xl font-black text-primary">
                {packingItems.filter(i => i.checked).length} / {packingItems.length}
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-accent h-full transition-all duration-300"
                  style={{ width: `${packingItems.length ? (packingItems.filter(i => i.checked).length / packingItems.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Packing Checklist Board (Right/Bottom) */}
          <div className="lg:col-span-2 space-y-6">
            {packingCategories.map((category) => {
              const categoryItems = packingItems.filter(item => item.category === category);
              if (categoryItems.length === 0) return null;

              return (
                <div key={category} className="space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">{category}</h4>
                  
                  <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-50 overflow-hidden shadow-sm">
                    {categoryItems.map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-center justify-between p-3.5 hover:bg-slate-50 transition-colors group select-none ${
                          item.checked ? 'bg-slate-50/50' : ''
                        }`}
                      >
                        <div 
                          onClick={() => togglePackingItem(item.id)}
                          className="flex items-center gap-3 flex-1 cursor-pointer"
                        >
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                            item.checked 
                              ? 'bg-accent border-accent text-white scale-102' 
                              : 'border-gray-300 group-hover:border-accent'
                          }`}>
                            {item.checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          
                          <span className={`text-xs font-semibold transition-all ${
                            item.checked 
                              ? 'text-gray-400 line-through font-normal' 
                              : 'text-primary'
                          }`}>
                            {item.text}
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeletePacking(item.id)}
                          className="p-1 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {packingItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-gray-200 rounded-2xl text-center space-y-2">
                <CheckSquare className="w-10 h-10 text-gray-300" />
                <h4 className="font-bold text-sm text-primary">Your Packing list is Empty</h4>
                <p className="text-xs text-gray-400 max-w-xs">Organize your clothing, electronics, and essentials to never forget travel luggage again.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

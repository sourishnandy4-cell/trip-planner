import React, { useState } from 'react';
import { X, UserPlus, Users, Copy, Check, Link, Share2 } from 'lucide-react';
import { isMockMode } from '../lib/supabaseClient';
import {
  MOCK_TRIPS, MOCK_TRIP_MEMBERS, MOCK_ITINERARY_ITEMS, MOCK_EXPENSES, saveMockData
} from '../lib/mockDatabase';

export const AddFriendsModal = ({ tripId, tripName, onClose, currentFriends = [] }) => {
  const [friendName, setFriendName] = useState('');
  const [friends, setFriends] = useState(currentFriends);
  const [copied, setCopied] = useState(false);

  // Build a self-contained encoded share link with full trip snapshot embedded
  const buildShareLink = () => {
    if (!isMockMode) {
      return `${window.location.origin}${window.location.pathname}?invite=${tripId}`;
    }
    try {
      const trip = MOCK_TRIPS.find(t => t.id === tripId);
      const members = MOCK_TRIP_MEMBERS.find(m => m.trip_id === tripId);
      const itinerary = MOCK_ITINERARY_ITEMS.filter(i => i.trip_id === tripId);
      const expenses = MOCK_EXPENSES.filter(e => e.trip_id === tripId);

      const payload = { trip, members, itinerary, expenses };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
      return `${window.location.origin}${window.location.pathname}?join=${encoded}`;
    } catch (e) {
      return `${window.location.origin}${window.location.pathname}?invite=${tripId}`;
    }
  };

  const shareLink = buildShareLink();

  const handleAddFriend = (e) => {
    e.preventDefault();
    const trimmed = friendName.trim();
    if (!trimmed || friends.includes(trimmed)) return;
    const updated = [...friends, trimmed];
    setFriends(updated);
    if (isMockMode) {
      const entry = MOCK_TRIP_MEMBERS.find(m => m.trip_id === tripId);
      if (entry) {
        if (!entry.members.includes(trimmed)) entry.members.push(trimmed);
      } else {
        MOCK_TRIP_MEMBERS.push({ trip_id: tripId, members: [trimmed] });
      }
      saveMockData();
    }
    setFriendName('');
  };

  const handleRemoveFriend = (name) => {
    const updated = friends.filter(f => f !== name);
    setFriends(updated);
    if (isMockMode) {
      const entry = MOCK_TRIP_MEMBERS.find(m => m.trip_id === tripId);
      if (entry) { entry.members = entry.members.filter(m => m !== name); saveMockData(); }
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-primary">Trip Members</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share section */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-primary">Invite friends to <span className="text-accent">{tripName}</span></p>
          </div>

          {isMockMode && (
            <div className="mb-3 p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 leading-relaxed">
              <strong>How it works:</strong> The link below encodes your entire trip snapshot. When your friend opens it, their app automatically imports the trip — <strong>no account needed</strong>.
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-500 truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-accent text-white rounded-xl hover:bg-accent/90 transition-all duration-200 flex items-center gap-2 text-sm font-bold flex-shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-1.5 pl-1">
            Share this link — your friend pastes it in their browser and the trip loads instantly.
          </p>
        </div>

        {/* Add Friend */}
        <form onSubmit={handleAddFriend} className="mb-5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Add Member Manually</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="Enter friend's name"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-sm"
            />
            <button
              type="submit"
              disabled={!friendName.trim()}
              className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 flex items-center gap-2 text-sm font-bold"
            >
              <UserPlus className="w-4 h-4" />
              Add
            </button>
          </div>
        </form>

        {/* Members list */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Members ({friends.length})</h3>
          {friends.length === 0 ? (
            <p className="text-center py-6 text-gray-400 text-sm">No members yet.</p>
          ) : (
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {friends.map((friend, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
                      {friend.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900 text-sm">{friend}</span>
                  </div>
                  <button onClick={() => handleRemoveFriend(friend)} className="text-red-400 hover:text-red-600 text-xs font-bold">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all duration-200 text-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, UserPlus, Users, Copy, Check, AlertCircle } from 'lucide-react';
import { isMockMode } from '../lib/supabaseClient';

export const AddFriendsModal = ({ tripId, tripName, onClose, currentFriends = [] }) => {
  const [friendName, setFriendName] = useState('');
  const [friends, setFriends] = useState(currentFriends);
  const [copied, setCopied] = useState(false);

  // Generate shareable link
  const shareLink = `${window.location.origin}?invite=${tripId}`;

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (friendName.trim() && !friends.includes(friendName.trim())) {
      const updated = [...friends, friendName.trim()];
      setFriends(updated);
      localStorage.setItem(`trip_${tripId}_friends`, JSON.stringify(updated));
      setFriendName('');
    }
  };

  const handleRemoveFriend = (name) => {
    const updated = friends.filter(f => f !== name);
    setFriends(updated);
    localStorage.setItem(`trip_${tripId}_friends`, JSON.stringify(updated));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-accent" />
            <h2 className="text-2xl font-bold text-primary">Trip Members</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-3">
            Share this trip: <span className="font-semibold">{tripName}</span>
          </p>
          
          {/* Mock Mode Warning */}
          {isMockMode && (
            <div className="mb-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-900 mb-1">⚠️ Mock Mode Active</h4>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    This app is running in <strong>demo mode</strong> using browser storage. Trip data <strong>cannot be shared</strong> across different browsers or devices.
                  </p>
                </div>
              </div>
              <div className="bg-white/60 rounded-lg p-3 text-xs text-amber-900">
                <p className="font-semibold mb-2">📋 To share trips with friends:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Set up Supabase backend (see MOCK_MODE_LIMITATIONS.md)</li>
                  <li>Or use the same browser/device for all users (not practical)</li>
                </ol>
              </div>
            </div>
          )}
          
          {/* Share Link */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={shareLink}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all duration-200 flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Add Friend Form */}
        <form onSubmit={handleAddFriend} className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Trip Member
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="Enter friend's name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
            />
            <button
              type="submit"
              disabled={!friendName.trim()}
              className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Add
            </button>
          </div>
        </form>

        {/* Friends List */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Trip Members ({friends.length})
          </h3>
          {friends.length === 0 ? (
            <div className="text-center py-6 text-gray-500 text-sm">
              No members added yet. Add friends to share this trip!
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {friends.map((friend, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-bold text-sm">
                      {friend.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">{friend}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveFriend(friend)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-all duration-200"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

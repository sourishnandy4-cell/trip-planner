import React, { useState } from 'react';
import { User } from 'lucide-react';

export const UsernameSetup = ({ onSave }) => {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onSave(username.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-accent flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">Welcome to Wandr!</h1>
          <p className="text-gray-600">Let's get started by creating your profile</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What should we call you? *
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your name"
              maxLength={30}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent text-lg"
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              This will be your display name for all trips
            </p>
          </div>

          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full px-6 py-3 bg-accent text-white font-bold rounded-xl hover:bg-accent/90 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
};

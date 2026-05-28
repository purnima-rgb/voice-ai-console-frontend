import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLE_DISPLAY } from '../../types';
import Button from '../Common/Button';

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
}

const roleColors: Record<string, string> = {
  system_admin: 'bg-purple-100 text-purple-700',
  data_manager: 'bg-blue-100 text-blue-700',
  support_agent: 'bg-cyan-100 text-cyan-700',
};

export default function Header({ title, onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      {/* Left: menu toggle + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Toggle menu"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
      </div>

      {/* Right: user info + logout */}
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <p className="text-sm font-medium text-gray-700">{user.name}</p>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColors[user.role] || 'bg-gray-100 text-gray-600'}`}
            >
              {ROLE_DISPLAY[user.role]}
            </span>
          </div>

          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <Button variant="ghost" size="sm" onClick={logout} className="hidden sm:inline-flex">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </Button>
        </div>
      )}
    </header>
  );
}

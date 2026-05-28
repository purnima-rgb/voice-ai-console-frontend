import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../Common/Button';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
            'Login failed. Please check your credentials.';
      setError(typeof msg === 'string' ? msg : 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoUsers = [
    { email: 'admin@voiceai.com', password: 'Admin@123', role: 'System Administrator', color: 'indigo' },
    { email: 'manager@voiceai.com', password: 'Manager@123', role: 'Data Manager', color: 'blue' },
    { email: 'agent@voiceai.com', password: 'Agent@123', role: 'Support Agent', color: 'cyan' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <svg className="w-9 h-9 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Voice AI Console</h1>
          <p className="text-indigo-200 mt-1 text-sm">Data Management Platform</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in to your account</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  placeholder-gray-400"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm
                  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                  placeholder-gray-400"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Sign in
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Demo Accounts
            </p>
            <div className="space-y-2">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.password); }}
                  className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 hover:border-indigo-300
                    hover:bg-indigo-50 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-700 group-hover:text-indigo-700">
                        {u.role}
                      </p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </div>
                    <span className="text-xs text-gray-300 group-hover:text-indigo-400">
                      {u.password}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-indigo-200 text-xs mt-6">
          GGU / Voice AI Data Management Console v1.0
        </p>
      </div>
    </div>
  );
}

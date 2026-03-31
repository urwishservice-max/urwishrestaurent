"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Lock, User, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('auth/admin/login', { username, password });
      login(data.user, data.token);
      toast.success("Welcome, Admin");
      router.push('/admin/dashboard');
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gray-800 p-8 text-white text-center">
          <div className="bg-gray-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-600">
            <ShieldCheck size={32} className="text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold">Urwish Admin</h1>
          <p className="text-gray-400 text-sm mt-1">Management Portal</p>
        </div>

        <form onSubmit={handleLogin} className="p-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Username"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? "AUTHENTICATING..." : "SIGN IN"}
          </button>
        </form>
      </div>
    </div>
  );
}

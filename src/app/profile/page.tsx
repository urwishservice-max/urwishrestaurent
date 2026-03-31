"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { 
  User, 
  Phone, 
  Calendar, 
  Save, 
  ArrowLeft,
  Camera,
  LogOut,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    dateOfBirth: user?.dateOfBirth || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        dateOfBirth: user.dateOfBirth || ''
      });
    }
  }, [user]);

  const handleUpdate = async () => {
    if (!formData.name) return toast.error("Name is required");
    
    setSaving(true);
    try {
      const { data } = await api.put('users/profile', formData);
      updateUser(data);
      toast.success("Profile updated successfully! ✨");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white p-6 sticky top-0 z-10 shadow-sm border-b border-gray-100">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-2xl transition-colors text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-black text-gray-800 tracking-tight uppercase italic">My Profile</h1>
          <button onClick={logout} className="p-2 hover:bg-red-50 rounded-2xl transition-colors text-red-500" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-xl mx-auto">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-10 text-center">
            <div className="relative group">
              <div className="w-32 h-32 bg-orange-100 rounded-[2.5rem] flex items-center justify-center text-orange-600 border-4 border-white shadow-xl shadow-orange-100 overflow-hidden">
                <User size={64} />
              </div>
              <button className="absolute bottom-0 right-0 p-2.5 bg-orange-500 rounded-2xl text-white border-4 border-white shadow-lg hover:scale-110 active:scale-95 transition-all">
                <Camera size={16} />
              </button>
            </div>
            <h2 className="mt-4 text-2xl font-black text-gray-800 tracking-tight">{user?.name}</h2>
            <p className="text-gray-400 font-medium text-xs uppercase tracking-widest">{user?.role} ACCOUNT</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 px-2">Display Name</label>
                <div className="relative flex items-center">
                  <User className="absolute left-6 text-gray-300" size={20} />
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-800 transition-all"
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 px-2">Phone Number (Verified)</label>
                <div className="relative flex items-center opacity-60 grayscale cursor-not-allowed">
                  <Phone className="absolute left-6 text-gray-300" size={20} />
                  <input 
                    type="text" 
                    readOnly
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-3xl outline-none font-bold text-gray-800"
                    value={user?.phone || ''}
                  />
                  <ShieldCheck className="absolute right-6 text-green-500" size={20} />
                </div>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-1 italic ml-4">Phone number cannot be changed for security.</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 px-2">Birthday 🎂</label>
                <div className="relative flex items-center">
                  <Calendar className="absolute left-6 text-gray-300" size={20} />
                  <input 
                    type="date" 
                    placeholder="YYYY-MM-DD"
                    className="w-full pl-16 pr-6 py-5 bg-gray-50 border-none rounded-3xl outline-none focus:ring-2 focus:ring-orange-500 font-bold text-gray-800 transition-all"
                    value={formData.dateOfBirth}
                    onChange={e => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <p className="text-[10px] text-gray-400 uppercase tracking-tighter mt-1 italic ml-4">We'll send you a special gift on your birthday!</p>
              </div>
            </div>

            <button 
              onClick={handleUpdate}
              disabled={saving}
              className="w-full bg-orange-500 text-white py-6 rounded-[2.5rem] font-black uppercase tracking-widest shadow-2xl shadow-orange-100 hover:bg-orange-600 active:scale-95 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
            >
              {saving ? 'UPDATING...' : (
                <>
                  <Save size={24} /> SAVE CHANGES
                </>
              )}
            </button>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-300 text-[10px] font-black tracking-[0.2em] uppercase">Urwish Restaurant &copy; 2026</p>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import { toast } from 'sonner';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [formData, setFormData] = useState({ name: '', phone: '', dob: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'info' | 'otp'>('info');
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  const { setTableNumber } = useCart();

  const table = searchParams.get('table');

  useEffect(() => {
    if (table) {
      setTableNumber(table);
    }
    if (user && user.role === 'customer') {
      router.push(`/menu${table ? `?table=${table}` : ''}`);
    }
  }, [user, table, router, setTableNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'signup') {
      if (!formData.name || !formData.phone || !formData.dob) {
        return toast.error("Please enter Name, Phone, and Date of Birth");
      }
      
      setLoading(true);
      try {
        await api.post('auth/customer/send-otp', { 
          phone: formData.phone,
          name: formData.name,
          dob: formData.dob
        });
        setStep('otp');
        toast.success("OTP sent to your phone");
      } catch (err: any) {
        console.error("OTP SEND ERROR:", err);
        toast.error(err.response?.data?.error || err.message || "Failed to send OTP");
      } finally {
        setLoading(false);
      }
    } else {
      // Direct Login (No OTP)
      if (!formData.phone) return toast.error("Please enter Phone number");
      
      setLoading(true);
      try {
        const { data } = await api.post('auth/customer/login', { phone: formData.phone });
        login(data.user, data.token);
        toast.success(`Welcome back, ${data.user.name}!`);
        router.push(`/menu${table ? `?table=${table}` : ''}`);
      } catch (err: any) {
        console.error("LOGIN ERROR:", err);
        toast.error(err.response?.data?.error || "Login failed. Please Sign Up.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return toast.error("Please enter OTP");
    
    setLoading(true);
    try {
      const { data } = await api.post('auth/customer/verify-otp', { phone: formData.phone, otp });
      login(data.user, data.token);
      toast.success(`Welcome, ${data.user.name}!`);
      router.push(`/menu${table ? `?table=${table}` : ''}`);
    } catch (err: any) {
      console.error("OTP VERIFY ERROR:", err);
      toast.error(err.response?.data?.error || err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6" suppressHydrationWarning>
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-500 border border-gray-100">
        <div className="bg-orange-500 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-black text-3xl shadow-lg mx-auto mb-4 transform -rotate-12">U</div>
          <h1 className="text-3xl font-bold tracking-tight">Urwish Restaurant</h1>
          <p className="mt-2 text-orange-100">{step === 'info' ? (mode === 'login' ? 'Welcome Back' : 'Join the Community') : 'Verify OTP'}</p>
        </div>
        
        <div className="px-8 pt-8">
          {table && (
            <div className="bg-orange-50 border border-orange-100 p-3 rounded-xl text-center mb-6">
              <span className="text-sm text-orange-600 font-medium">Ordering for Table: </span>
              <span className="text-lg font-bold text-orange-700">{table}</span>
            </div>
          )}

          {step === 'info' && (
            <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
              <button 
                onClick={() => setMode('login')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === 'login' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
              >
                Login
              </button>
              <button 
                onClick={() => setMode('signup')}
                className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all ${mode === 'signup' ? 'bg-white shadow-sm text-black' : 'text-gray-500'}`}
              >
                Signup
              </button>
            </div>
          )}
        </div>

        <form onSubmit={step === 'info' ? handleSubmit : handleVerifyOtp} className="p-8 pt-0 space-y-6">
          <div className="space-y-4">
            {step === 'info' ? (
              <>
                {mode === 'signup' && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-bold text-sm"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required={mode === 'signup'}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-bold text-sm"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                {mode === 'signup' && (
                  <div className="animate-in slide-in-from-top-2 duration-300">
                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 ml-4 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      className="w-full px-5 py-3 rounded-2xl bg-gray-50 border border-gray-100 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-bold text-sm"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                      required={mode === 'signup'}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="animate-in zoom-in-95 duration-300">
                <label className="block text-xs font-black uppercase tracking-widest text-gray-400 text-center mb-4">Enter 6-digit OTP sent to {formData.phone}</label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  className="w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all text-center text-3xl tracking-[0.8em] font-black"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => setStep('info')}
                  className="w-full mt-4 text-sm text-gray-400 font-bold hover:text-black transition-colors"
                >
                  Change phone number?
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-orange-200 transform active:scale-[0.98] transition-all disabled:opacity-50 text-lg tracking-tight"
          >
            {loading ? "Processing..." : (step === 'info' ? (mode === 'signup' ? "SEND OTP" : "SIGN IN") : "VERIFY & CONTINUE")}
          </button>
        </form>
      </div>
      
      <p className="mt-8 text-gray-400 text-sm font-bold tracking-tight">
        © 2026 Urwish Restaurant. All rights reserved.
        <br />
        <button 
          onClick={() => router.push('/admin/login')}
          className="mt-2 text-[10px] text-gray-300 hover:text-orange-500 transition-colors uppercase tracking-widest font-black"
        >
          Admin Portal
        </button>
      </p>
    </div>
  );
}

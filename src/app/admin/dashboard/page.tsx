"use client";

import React, { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { TrendingUp, Users, DollarSign, Clock, Receipt } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({ totalOrders: 0, revenue: 0, customers: 0 });
  const [popular, setPopular] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const { logout } = useAuth();
  const socket = useSocket();
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speakOrder = (order: any) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const itemsSummary = order.items.map((item: any) => `${item.quantity} ${item.name}`).join('... ');
    const announcement = `Table ${order.tableNumber} alert! New order for ${itemsSummary}`;
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.9;
    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    fetchStats();
    fetchPopular();
    fetchRecent();

    if (socket) {
      socket.on('new_order', (order: any) => {
        setRecentOrders(prev => [order, ...prev.slice(0, 4)]);
        // Re-fetch stats for accuracy
        fetchStats();
        speakOrder(order);
      });
      socket.on('order_status_updated', (updated: any) => {
        setRecentOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
        fetchStats();
      });
    }

    return () => {
      socket?.off('new_order');
      socket?.off('order_status_updated');
    };
  }, [socket]);

  const fetchRecent = async () => {
    try {
      const { data } = await api.get('/orders');
      setRecentOrders(data.slice(0, 5));
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    try {
      const { data } = await api.get('/orders');
      const rev = data.reduce((acc: number, o: any) => acc + (o.status === 'Paid' ? o.totalAmount : 0), 0);
      setStats({
        totalOrders: data.length,
        revenue: rev,
        customers: new Set(data.map((o: any) => o.customer.phone)).size
      });
    } catch (err) {
      toast.error("Failed to load statistics");
    }
  };

  const fetchPopular = async () => {
    try {
      const { data } = await api.get('/orders/analytics/popular');
      setPopular(data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <div className="flex-1 p-8">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-800 text-premium">Insights Dashboard</h1>
          <p className="text-gray-400 mt-1">Real-time performance analytics</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-6"><DollarSign size={24} /></div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Total Revenue</p>
            <h2 className="text-4xl font-black text-gray-800">₹{stats.revenue}</h2>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6"><TrendingUp size={24} /></div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Total Orders</p>
            <h2 className="text-4xl font-black text-gray-800">{stats.totalOrders}</h2>
          </div>
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-6"><Users size={24} /></div>
            <p className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-1">Unique Customers</p>
            <h2 className="text-4xl font-black text-gray-800">{stats.customers}</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Items */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-orange-500" /> Popular Today
            </h3>
            <div className="space-y-6">
              {popular.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-black text-gray-300 w-4">0{index + 1}</span>
                    <span className="font-bold text-gray-700">{item._id}</span>
                  </div>
                  <span className="text-sm bg-gray-50 px-3 py-1 rounded-full font-bold text-gray-500">{item.count} orders</span>
                </div>
              ))}
              {popular.length === 0 && <p className="text-gray-300 italic">No data yet</p>}
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock size={20} className="text-blue-500" /> System Status
            </h3>
            <div className="p-4 bg-green-50 border border-green-100 rounded-2xl flex items-center gap-4 text-green-700">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="font-bold">Backend API Online</span>
            </div>
            <div className="p-4 mt-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4 text-blue-700">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="font-bold">Real-time Sockets Connected</span>
            </div>
          </div>
        </div>

        {/* Live Orders Monitor */}
        <div className="mt-12 bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Receipt size={20} className="text-orange-500" /> Live Order Monitor
            </h3>
            <button className="text-sm font-bold text-orange-500 hover:bg-orange-50 px-4 py-2 rounded-xl transition-all">View All Orders</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-gray-400 text-xs font-black uppercase tracking-widest border-b border-gray-50">
                  <th className="pb-4">Order ID</th>
                  <th className="pb-4">Table</th>
                  <th className="pb-4">Customer</th>
                  <th className="pb-4">Amount</th>
                  <th className="pb-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order._id} className="group hover:bg-gray-50 transition-colors">
                    <td className="py-6 text-sm font-bold text-gray-400">#...{order._id.slice(-6)}</td>
                    <td className="py-6 font-bold text-gray-800">T{order.tableNumber}</td>
                    <td className="py-6">
                      <p className="font-bold text-gray-800 text-sm">{order.customer.name}</p>
                      <p className="text-xs text-gray-400">{order.customer.phone}</p>
                    </td>
                    <td className="py-6 font-black text-gray-800">₹{order.totalAmount}</td>
                    <td className="py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === 'Paid' ? 'bg-green-100 text-green-600' : 
                        order.status === 'Ready' ? 'bg-blue-100 text-blue-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

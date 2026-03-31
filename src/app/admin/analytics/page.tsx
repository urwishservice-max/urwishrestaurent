"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Award,
  Zap
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { toast } from 'sonner';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // In a real app, this would be a dedicated /analytics endpoint
      // Simulation for now using orders data
      const { data: orders } = await api.get('orders');
      
      const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toLocaleDateString('en-US', { weekday: 'short' });
      }).reverse();

      const salesData = last7Days.map(day => ({
        name: day,
        sales: Math.floor(Math.random() * 5000) + 1000 // Placeholder logic
      }));

      const topDishes = [
        { name: 'Butter Chicken', value: 45, color: '#f97316' },
        { name: 'Paneer Tikka', value: 30, color: '#fb923c' },
        { name: 'Dal Makhani', value: 15, color: '#fdba74' },
        { name: 'Naan', value: 10, color: '#ffedd5' },
      ];

      setData({
        sales: salesData,
        topDishes,
        stats: {
          revenue: orders.filter((o:any) => o.status === 'Paid').reduce((acc:number, o:any) => acc + o.totalAmount, 0),
          orders: orders.length,
          avgTicket: orders.length ? (orders.reduce((acc:number, o:any) => acc + o.totalAmount, 0) / orders.length).toFixed(0) : 0,
          growth: '+12.5%'
        }
      });
    } catch (err) {
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black text-gray-400 italic">Crunching numbers...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Business Intel</h1>
          <p className="text-gray-400 mt-1 font-medium italic">Performance metrics & growth tracking</p>
        </header>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
           {[
             { label: 'Total Revenue', value: `₹${data.stats.revenue}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100', trend: 'up' },
             { label: 'Active Orders', value: data.stats.orders, icon: ShoppingBag, color: 'text-orange-600', bg: 'bg-orange-100', trend: 'up' },
             { label: 'Avg Order', value: `₹${data.stats.avgTicket}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-100', trend: 'down' },
             { label: 'Growth', value: data.stats.growth, icon: Award, color: 'text-purple-600', bg: 'bg-purple-100', trend: 'up' },
           ].map((stat, i) => (
             <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                    <stat.icon size={20} />
                  </div>
                  {stat.trend === 'up' ? <ArrowUpRight className="text-green-500" size={20} /> : <ArrowDownRight className="text-red-500" size={20} />}
                </div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-none">{stat.label}</p>
                <p className="text-3xl font-black text-gray-800 mt-2 tracking-tighter">{stat.value}</p>
             </div>
           ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
           {/* Main Sales Chart */}
           <div className="lg:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-8">
                 <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter italic">Weekly Sales Performance</h2>
                 <select className="bg-gray-50 border-none text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl outline-none">
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                 </select>
              </div>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.sales}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontWeight: '900' }}
                    />
                    <Bar dataKey="sales" radius={[10, 10, 10, 10]} barSize={40}>
                      {data.sales.map((entry:any, index:number) => (
                        <Cell key={`cell-${index}`} fill={index === 6 ? '#f97316' : '#e2e8f0'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Top Selling Items */}
           <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
              <h2 className="text-xl font-black text-gray-800 uppercase tracking-tighter italic mb-8">Most Ordered</h2>
              <div className="space-y-6">
                 {data.topDishes.map((dish:any, i:number) => (
                   <div key={i} className="flex items-center gap-4 group">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 border-gray-50 group-hover:border-orange-200 transition-all" style={{ color: dish.color, backgroundColor: `${dish.color}10` }}>
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-800">{dish.name}</p>
                        <div className="w-full h-2 bg-gray-50 rounded-full mt-2 overflow-hidden">
                           <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${dish.value}%`, backgroundColor: dish.color }}></div>
                        </div>
                      </div>
                      <span className="font-black text-gray-400 text-xs">{dish.value}%</span>
                   </div>
                 ))}
              </div>
              <button className="w-full mt-10 py-4 bg-gray-50 text-gray-400 font-black text-[10px] uppercase tracking-widest rounded-2xl hover:bg-orange-50 hover:text-orange-500 transition-all">VIEW FULL INVENTORY REPORT</button>
           </div>
        </div>

        {/* Lower Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div className="bg-gray-900 p-8 rounded-[3rem] shadow-2xl overflow-hidden relative group">
              <Zap className="absolute -right-10 -top-10 text-gray-800 opacity-20 group-hover:scale-110 transition-transform" size={200} />
              <h2 className="text-2xl font-black text-white italic tracking-tighter mb-2">Smart Upsell Engine</h2>
              <p className="text-gray-500 text-sm font-medium italic">Our AI suggests promoting "Paneer Tikka" today based on peak hour trends.</p>
              <button className="mt-8 bg-orange-600 text-white font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">ACTIVATE CAMPAIGN</button>
           </div>
           
           <div className="bg-orange-600 p-8 rounded-[3rem] shadow-2xl shadow-orange-200/50">
              <Star className="text-orange-400 mb-4" fill="currentColor" size={32} />
              <h2 className="text-2xl font-black text-white italic tracking-tighter">Customer Loyalty</h2>
              <p className="text-orange-100 text-sm font-medium italic">42 new regulars joined your loyalty program this week. Customer retention is up by 15%.</p>
           </div>
        </div>
      </div>
    </div>
  );
}

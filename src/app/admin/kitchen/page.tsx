"use client";

import React, { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { ChefHat, PackageCheck, Clock, Volume2, VolumeX, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import AdminSidebar from '@/components/AdminSidebar';

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const socket = useSocket();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speakOrder = (order: any) => {
    if (!synthRef.current) return;
    
    // Stop any ongoing speech
    synthRef.current.cancel();

    const itemsSummary = order.items.map((item: any) => `${item.quantity} ${item.name}`).join('... ');
    const announcement = `Attention! Table ${order.tableNumber} placed ${itemsSummary}`;
    
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.85; // Slightly slower for clarity
    utterance.pitch = 1.1; // Friendly higher pitch
    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(() => setCurrentTime(new Date()), 30000); // Update every 30s

    if (socket) {
      socket.emit('join_kitchen');
      socket.on('new_order', (order: any) => {
        setOrders(prev => [order, ...prev]);
        toast.info(`New Order! Table ${order.tableNumber}`);
        
        if (soundEnabled) {
          // 1. Play beeping alert
          if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
          }
          // 2. AI Voice Announcement
          speakOrder(order);
        }
      });
      socket.on('order_status_updated', (updated: any) => {
        setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      });
    }

    return () => {
      socket?.off('new_order');
      socket?.off('order_status_updated');
      clearInterval(timer);
    };
  }, [socket, soundEnabled]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('orders');
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load orders");
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`orders/${id}`, { status });
      toast.success(`Order is now ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const getTimeDiff = (date: string) => {
    const diff = Math.floor((currentTime.getTime() - new Date(date).getTime()) / 60000);
    return diff;
  };

  const activeOrders = orders.filter(o => !['Completed', 'Paid'].includes(o.status));

  return (
    <div className="min-h-screen bg-gray-900 flex text-white">
      <AdminSidebar />
      <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-8 overflow-y-auto max-h-screen">
        <header className="flex justify-between items-center mb-10">
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Kitchen Flow</h1>
               <div className="px-3 py-1 bg-orange-600 rounded-lg text-xs font-black animate-pulse">LIVE</div>
            </div>
            <p className="text-gray-500 font-bold mt-1 text-sm tracking-widest uppercase">Handling {activeOrders.length} active hunger requests</p>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-4 rounded-2xl transition-all ${soundEnabled ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'bg-gray-800 text-gray-500 border border-gray-700'}`}
            >
              {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
            </button>
            <div className="hidden md:block text-right">
               <p className="text-2xl font-black">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
               <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Kitchen Clock</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {activeOrders.map((order) => {
            const minutesAgo = getTimeDiff(order.createdAt);
            const isLate = minutesAgo > 15;

            return (
              <div key={order._id} className={`bg-[#1a1c1e] rounded-[3rem] shadow-2xl border-2 transition-all overflow-hidden flex flex-col ${isLate ? 'border-red-500/50 shadow-red-900/10' : 'border-gray-800'}`}>
                <div className={`p-8 ${isLate ? 'bg-red-500/10' : 'bg-gray-800/30'} flex justify-between items-start border-b border-gray-800`}>
                  <div>
                    <h2 className="text-4xl font-black text-white mb-2 tracking-tighter italic">Table {order.tableNumber}</h2>
                    <div className="flex items-center gap-3">
                       <span className={`flex items-center gap-1.5 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isLate ? 'bg-red-500 text-white' : 'bg-orange-600 text-white'}`}>
                        <Clock size={12} /> {minutesAgo}m ago
                       </span>
                       <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">#{order._id.slice(-4)}</span>
                    </div>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-3xl border border-gray-800 text-center min-w-[100px]">
                     <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Items</p>
                     <p className="text-2xl font-black text-white">{order.items.length}</p>
                  </div>
                </div>

                <div className="p-8 flex-1 space-y-4">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-gray-800 flex items-center justify-center font-black text-orange-500 text-xl border border-gray-700 shrink-0">
                          {item.quantity}
                        </div>
                        <div className="pt-1">
                          <span className="text-xl font-bold text-gray-200 block leading-tight">{item.name}</span>
                          <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">Regular Portion</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLate && (
                    <div className="mt-4 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500">
                      <AlertTriangle size={18} />
                      <span className="text-xs font-black uppercase tracking-widest leading-none">Warning: Order is delayed!</span>
                    </div>
                  )}
                </div>

                <div className="p-8 bg-black/20 flex gap-4 mt-auto">
                  {order.status === 'Order Placed' && (
                    <button 
                      onClick={() => updateStatus(order._id, 'Preparing')}
                      className="flex-1 bg-orange-600 text-white font-black py-6 rounded-3xl shadow-xl shadow-orange-900/20 hover:bg-orange-700 active:scale-95 transition-all flex items-center justify-center gap-3 tracking-widest uppercase text-sm"
                    >
                      <ChefHat size={24} /> START PREP
                    </button>
                  )}
                  {order.status === 'Preparing' && (
                    <button 
                      onClick={() => updateStatus(order._id, 'Ready')}
                      className="flex-1 bg-green-600 text-white font-black py-6 rounded-3xl shadow-xl shadow-green-900/20 hover:bg-green-700 active:scale-95 transition-all flex items-center justify-center gap-3 tracking-widest uppercase text-sm"
                    >
                      <PackageCheck size={24} /> PACK & READY
                    </button>
                  )}
                  {order.status === 'Ready' && (
                    <button 
                      onClick={() => updateStatus(order._id, 'Completed')}
                      className="flex-1 bg-blue-600 text-white font-black py-6 rounded-3xl shadow-xl shadow-blue-900/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-3 tracking-widest uppercase text-sm"
                    >
                      <CheckCircle size={24} /> DISPATCHED
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          
          {activeOrders.length === 0 && (
            <div className="col-span-full py-40 border-4 border-dashed border-gray-800 rounded-[5rem] flex flex-col items-center justify-center text-center opacity-30">
              <ChefHat size={120} className="text-gray-700 mb-8" />
              <h3 className="text-4xl font-black text-gray-600 uppercase italic tracking-tighter">Kitchen Clear</h3>
              <p className="text-gray-700 font-bold mt-2 uppercase tracking-widest">Waiting for new orders...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

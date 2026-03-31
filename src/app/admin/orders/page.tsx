"use client";

import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import { 
  Receipt, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  MoreVertical, 
  ChevronRight,
  TrendingUp,
  DollarSign,
  Coffee
} from 'lucide-react';
import { toast } from 'sonner';
import AdminSidebar from '@/components/AdminSidebar';
import { useSocket } from '@/context/SocketContext';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
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
    const announcement = `New Order! Table ${order.tableNumber} sent ${itemsSummary}`;
    const utterance = new SpeechSynthesisUtterance(announcement);
    utterance.rate = 0.9;
    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    fetchOrders();
    
    if (socket) {
      socket.on('new_order', (order: any) => {
        setOrders(prev => [order, ...prev]);
        toast.success(`New order received! Table ${order.tableNumber}`);
        speakOrder(order);
      });
      socket.on('order_status_updated', (updated: any) => {
        setOrders(prev => prev.map(o => o._id === updated._id ? updated : o));
      });
    }

    return () => {
      socket?.off('new_order');
      socket?.off('order_status_updated');
    };
  }, [socket]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('orders');
      setOrders(data);
    } catch (err) {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await api.put(`orders/${id}`, { status });
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesFilter = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesSearch = o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          o.customer.phone.includes(searchQuery) ||
                          o.tableNumber.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  const dailyTotal = orders
    .filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString() && o.status === 'Paid')
    .reduce((acc, current) => acc + current.totalAmount, 0);

  const pendingCount = orders.filter(o => o.status === 'Order Placed' || o.status === 'Preparing').length;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Order Management</h1>
            <p className="text-gray-400 mt-1">Real-time order processing & billing dashboard</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
               <div className="bg-green-100 text-green-600 p-2 rounded-2xl"><DollarSign size={20} /></div>
               <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase">Today's Revenue</p>
                 <p className="text-xl font-black text-gray-800 tracking-tight">₹{dailyTotal}</p>
               </div>
             </div>
             <div className="bg-white px-6 py-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
               <div className="bg-orange-100 text-orange-600 p-2 rounded-2xl"><Clock size={20} /></div>
               <div>
                 <p className="text-[10px] font-black text-gray-400 uppercase">Active Orders</p>
                 <p className="text-xl font-black text-gray-800 tracking-tight">{pendingCount}</p>
               </div>
             </div>
          </div>
        </header>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
             {['ALL', 'Order Placed', 'Preparing', 'Ready', 'Completed', 'Paid'].map((s) => (
                <button 
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 ${
                    filterStatus === s ? 'bg-orange-600 text-white shadow-lg shadow-orange-100' : 'bg-white text-gray-400 hover:bg-gray-100 border border-gray-100'
                  }`}
                >
                  {s === 'Order Placed' ? 'Pending' : s}
                </button>
             ))}
          </div>
          
          <div className="bg-white px-4 py-3 rounded-2xl border border-gray-100 flex items-center gap-3 w-full md:w-80 shadow-sm">
            <Search size={18} className="text-gray-300" />
            <input 
              type="text" 
              placeholder="Search table, name, or phone..."
              className="bg-transparent border-none outline-none font-bold text-sm w-full"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="grid grid-cols-1 gap-4">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden hover:border-orange-200 transition-all group">
              <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
                 {/* Table Info */}
                 <div className="w-20 h-20 bg-gray-50 rounded-3xl flex flex-col items-center justify-center border border-gray-100 shrink-0">
                    <span className="text-[10px] font-black text-gray-400 uppercase leading-none">Table</span>
                    <span className="text-3xl font-black text-gray-800">{order.tableNumber}</span>
                 </div>

                 {/* Customer & Time */}
                 <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-800 text-xl truncate">{order.customer.name}</h3>
                      <span className="px-3 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-widest">#{order._id.slice(-6)}</span>
                      {order.isBirthdayOrder && (
                        <span className="px-3 py-1 bg-pink-100 text-pink-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse border border-pink-200">
                          🎂 Birthday Order
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                      <span className="flex items-center gap-1"><Clock size={12} /> {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>{order.customer.phone}</span>
                    </div>
                 </div>

                 {/* Order Items Summary */}
                 <div className="md:w-64">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-2 tracking-widest">Order Details</p>
                    <div className="space-y-1">
                       {order.items.map((item: any, idx: number) => (
                         <p key={idx} className="text-xs font-bold text-gray-600 truncate">
                            {item.quantity}x <span className="text-gray-800">{item.name}</span>
                         </p>
                       ))}
                    </div>
                 </div>

                 {/* Pricing & Status */}
                 <div className="flex flex-row md:flex-col items-center justify-between md:items-end gap-3 shrink-0">
                    <div className="text-right">
                       <p className="text-2xl font-black text-gray-800">₹{order.totalAmount}</p>
                       <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                         order.status === 'Paid' ? 'bg-green-100 text-green-600' : 
                         order.status === 'Ready' ? 'bg-blue-100 text-blue-600' :
                         'bg-orange-100 text-orange-600'
                       }`}>
                         {order.status}
                       </span>
                    </div>
                    
                    <div className="flex gap-2">
                       {order.status === 'Order Placed' && (
                         <button onClick={() => updateStatus(order._id, 'Preparing')} className="bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-orange-100 hover:bg-orange-700 transition-all">START PREPARING</button>
                       )}
                       {order.status === 'Preparing' && (
                         <button onClick={() => updateStatus(order._id, 'Ready')} className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-100 hover:bg-blue-700 transition-all">MARK AS READY</button>
                       )}
                       {order.status === 'Ready' && (
                         <button onClick={() => updateStatus(order._id, 'Completed')} className="bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-black transition-all">SERVED / DONE</button>
                       )}
                       {order.status === 'Completed' && (
                         <button onClick={() => updateStatus(order._id, 'Paid')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-green-100 hover:bg-green-700 transition-all flex items-center gap-1"><DollarSign size={14} /> MARK PAID</button>
                       )}
                    </div>
                 </div>
              </div>
            </div>
          ))}
          
          {loading && <div className="p-20 text-center font-bold text-gray-400 italic">Fastening your data...</div>}
          {!loading && filteredOrders.length === 0 && (
             <div className="p-20 bg-white rounded-[2.5rem] text-center border-2 border-dashed border-gray-100">
                <Receipt className="mx-auto text-gray-200 mb-4" size={64} />
                <p className="text-xl font-bold text-gray-400 italic">No orders found for current filter.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

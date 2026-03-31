"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useSocket } from '@/context/SocketContext';
import { ChevronLeft, Info, CheckCircle2, Clock, ChefHat, PackageCheck, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

const STATUS_STEPS = [
  { id: 'Order Placed', label: 'Order Received', icon: Clock, progressMsg: 'Waiting for kitchen to accept...' },
  { id: 'Preparing', label: 'In the Kitchen', icon: ChefHat, progressMsg: 'Chef is cooking your meal...' },
  { id: 'Ready', label: 'Ready for Serving', icon: PackageCheck, progressMsg: 'Waiter is bringing it to you...' },
  { id: 'Completed', label: 'Served', icon: CheckCircle2, progressMsg: 'Enjoy your meal!' },
  { id: 'Paid', label: 'Bill Paid', icon: CreditCard, progressMsg: 'Thank you for visiting!' },
];

export default function OrderTrackingPage() {
  const { id } = useParams();
  const router = useRouter();
  const socket = useSocket();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speakStatus = async (status: string, items?: any[]) => {
    if (!synthRef.current) return;
    synthRef.current.cancel();
    const step = STATUS_STEPS.find(s => s.id === status);
    if (!step) return;

    let message = step.progressMsg;

    // Special Logic for Served status: Add AI Drink Suggestion
    if (status === 'Completed' && items) {
      try {
        const { data } = await api.post('ai/suggest-drink', { items });
        if (data.suggestion) {
          message = `${step.progressMsg} By the way, would you like a ${data.suggestion} with this? It pairs perfectly with your meal.`;
        }
      } catch (err) {
        console.error("AI Suggestion failed", err);
      }
    }

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    synthRef.current.speak(utterance);
  };

  useEffect(() => {
    fetchOrder();
    
    if (socket) {
      socket.on('order_status_updated', (updatedOrder: any) => {
        if (updatedOrder._id === id) {
          setOrder(updatedOrder);
          toast.info(`Order status: ${updatedOrder.status}`);
          speakStatus(updatedOrder.status, updatedOrder.items);
        }
      });
    }

    return () => {
      socket?.off('order_status_updated');
    };
  }, [id, socket]);

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`orders/${id}`);
      setOrder(data);
    } catch (err) {
      toast.error("Failed to fetch order status");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Tracking your order...</div>;
  if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === order.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white p-4 sticky top-0 z-30 shadow-sm flex items-center gap-4">
        <button onClick={() => router.push('/menu')} className="p-2 hover:bg-gray-100 rounded-xl">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Order Status</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 mt-4 space-y-6">
        {/* Status Stepper */}
        <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
          <div className="text-center mb-10">
            <h2 className="text-sm font-bold text-orange-500 uppercase tracking-widest mb-1">Status Tracking</h2>
            <p className="text-2xl font-black text-gray-800">Table {order.tableNumber}</p>
          </div>

          <div className="relative space-y-8">
            {/* Vertical Line */}
            <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-100"></div>
            <div 
              className="absolute left-6 top-2 w-0.5 bg-orange-500 transition-all duration-1000"
              style={{ height: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
            ></div>

            {STATUS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.id} className="flex items-center gap-6 relative z-10">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                    isCompleted ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className={`font-bold transition-colors ${isCompleted ? 'text-gray-800' : 'text-gray-300'}`}>
                      {step.label}
                    </p>
                    {isCurrent && <p className="text-xs text-orange-500 font-medium animate-pulse mt-0.5">{step.progressMsg}</p>}
                  </div>
                  {isCompleted && !isCurrent && index < STATUS_STEPS.length - 1 && (
                    <CheckCircle2 size={18} className="ml-auto text-green-500" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Mini */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50 p-4 border-b flex justify-between items-center text-sm">
            <span className="text-gray-500 font-medium">Order ID: ...{order._id.slice(-6)}</span>
            <span className="font-bold text-gray-800">₹{order.totalAmount}</span>
          </div>
          <div className="p-4 space-y-2">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-600">{item.quantity}x {item.name}</span>
                <span className="text-gray-400">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 flex gap-4">
          <Info className="text-orange-500 shrink-0" size={24} />
          <p className="text-sm text-orange-800 leading-relaxed">
            Need anything? Just wave your hand to our staff or use the **Anotbot AI** in the menu to request assistance.
          </p>
        </div>
      </div>
    </div>
  );
}

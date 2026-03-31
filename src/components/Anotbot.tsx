"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, Mic } from 'lucide-react';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

export default function Anotbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; text: string; suggestions?: any[] }[]>([
    { role: 'assistant', text: "Hello! I'm Anotbot. How can I help you order today?" }
  ]);
  const [menu, setMenu] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const { data } = await api.get('menu');
      setMenu(data);
    } catch (err) {
      console.error("Failed to load menu for AI bot");
    }
  };

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const message = text || input;
    if (!message.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: message }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('ai/chat', { prompt: message });
      
      const aiText = data.text || "I'm having trouble understanding that.";
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        text: aiText, 
        suggestions: data.suggested_items_full 
      }]);

      // 1. If intent is ORDER, add to cart
      if (data.intent === 'ORDER' && data.detected_order) {
        data.detected_order.forEach((detectedItem: any) => {
          const menuItem = menu.find(m => 
            m.name.toLowerCase().includes(detectedItem.name.toLowerCase()) ||
            detectedItem.name.toLowerCase().includes(m.name.toLowerCase())
          );

          if (menuItem) {
            const qty = Number(detectedItem.quantity) || 1;
            addToCart({ 
              menuId: menuItem._id, 
              name: menuItem.name, 
              price: menuItem.price, 
              quantity: qty 
            });
            toast.success(`AI Added: ${menuItem.name} (x${qty}) 🚀`);
          }
        });
      }
      // 2. If intent is CANCEL, fetch user orders
      if (data.intent === 'CANCEL') {
        const userPhone = localStorage.getItem('userPhone');
        if (userPhone) {
          const { data: orders } = await api.get(`orders/customer/my-orders?phone=${userPhone}`);
          // Filter for cancellable orders
          const cancellable = orders.filter((o: any) => !['Delivered', 'Cancelled'].includes(o.status));
          
          if (cancellable.length > 0) {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              text: "I found your active orders. Which one would you like to cancel?",
              suggestions: cancellable.map((o: any) => ({
                _id: o._id,
                name: `Order #${o._id.slice(-4)}`,
                price: o.totalAmount,
                isOrder: true,
                items: o.items
              }))
            }]);
          } else {
             setMessages(prev => [...prev, { role: 'assistant', text: "You don't have any active orders that can be cancelled right now." }]);
          }
        } else {
          setMessages(prev => [...prev, { role: 'assistant', text: "Please log in to manage and cancel your orders." }]);
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.text || "The AI service is currently busy or unavailable. Please try again in a moment.";
      setMessages(prev => [...prev, { role: 'assistant', text: errorMsg }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {isOpen ? (
        <div className="bg-white w-80 sm:w-[400px] h-[600px] rounded-[3rem] shadow-[0_32px_128px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden border border-gray-100 animate-in slide-in-from-bottom-10 duration-500">
          <div className="bg-gradient-to-r from-orange-600 to-orange-400 p-6 text-white flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-2xl backdrop-blur-md">
                <Bot size={24} className="animate-pulse" />
              </div>
              <div>
                <span className="font-black text-lg block leading-none">Anotbot</span>
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">AI Waiter • Online</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform"><X size={20} /></button>
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scroll-smooth">
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-[2rem] text-sm font-bold leading-relaxed ${
                  m.role === 'user' ? 'bg-zinc-900 text-white rounded-br-none' : 'bg-gray-100 text-zinc-900 rounded-bl-none'
                }`}>
                  {m.text}
                </div>

                {/* Interactive Suggestions Container */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto py-4 w-full no-scrollbar px-2">
                    {m.suggestions.map((item: any) => (
                      <div key={item._id} className="min-w-[160px] bg-white border border-gray-100 rounded-3xl p-3 shadow-md hover:shadow-xl transition-all group flex flex-col gap-2">
                        {item.image && (
                          <div className="h-20 w-full rounded-2xl overflow-hidden">
                             <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-black line-clamp-1">{item.name}</p>
                          <p className="text-[10px] font-bold text-orange-500">₹{item.price}</p>
                        </div>
                        <button 
                          onClick={async () => {
                            if (item.isOrder) {
                              try {
                                await api.patch(`orders/${item._id}/cancel`);
                                toast.success("Order Cancelled Successfully!");
                                handleSend("Order cancelled"); // Simple refresh feel
                              } catch (e) {
                                toast.error("Failed to cancel order");
                              }
                            } else {
                              addToCart({ menuId: item._id, name: item.name, price: item.price, quantity: 1 });
                              toast.success(`Added ${item.name} to cart!`);
                            }
                          }}
                          className={`w-full py-2 text-white text-[10px] font-black rounded-xl transition-colors ${
                            item.isOrder ? 'bg-red-500 hover:bg-red-700' : 'bg-zinc-900 hover:bg-orange-500'
                          }`}
                        >
                          {item.isOrder ? 'CANCEL ORDER' : 'ADD TO CART'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-4 rounded-[2rem] rounded-bl-none shadow-sm flex items-center gap-2">
                   <div className="flex gap-1">
                      <div className="size-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                      <div className="size-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      <div className="size-1.5 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-white border-t border-gray-50 flex gap-3 items-center">
            <div className="flex-1 bg-gray-50 rounded-[2rem] px-6 py-4 flex items-center gap-3 border border-gray-100 focus-within:border-orange-200 transition-all">
              <input
                type="text"
                placeholder="Message Anotbot..."
                className="flex-1 bg-transparent border-none outline-none text-sm font-bold text-zinc-800"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button className="text-gray-400 hover:text-orange-500 transition-colors">
                <Mic size={18} />
              </button>
            </div>
            <button 
              onClick={() => handleSend()}
              className="bg-zinc-900 text-white p-4 rounded-[1.5rem] hover:bg-orange-600 transition-all active:scale-90 shadow-lg"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-zinc-900 text-white p-5 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.3)] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group border-4 border-white"
        >
          <div className="bg-orange-500 p-2 rounded-2xl group-hover:rotate-12 transition-transform">
            <Bot size={28} />
          </div>
          <span className="font-black text-lg tracking-tight hidden sm:inline">Ask AI Waiter</span>
        </button>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Megaphone, 
  Zap, 
  Target, 
  MessageSquare, 
  Star, 
  Bot, 
  Sparkles,
  ArrowRight,
  Send,
  Bell,
  CheckCircle2,
  Save,
  Trash2
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { useSocket } from '@/context/SocketContext';
import { toast } from 'sonner';

export default function AdminMarketingPage() {
  const [aiEnabled, setAiEnabled] = useState(true);
  const [activeCampaign, setActiveCampaign] = useState<string | null>(null);
  const [flashMessage, setFlashMessage] = useState('');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [storedOffers, setStoredOffers] = useState<any[]>([]);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [customRate, setCustomRate] = useState('');
  const [customImage, setCustomImage] = useState('');
  const [isAnnouncement, setIsAnnouncement] = useState(false);
  
  // WhatsApp Marketing State
  const [broadcastTarget, setBroadcastTarget] = useState<'all' | 'specific'>('all');
  const [targetPhone, setTargetPhone] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [waLoading, setWaLoading] = useState(false);
  
  const socket = useSocket();

  useEffect(() => {
    fetchMenu();
    fetchOffers();
  }, []);

  const fetchMenu = async () => {
    try {
      const { data } = await api.get('menu');
      setMenuItems(data);
    } catch (err) {
      console.error("Failed to fetch menu");
    }
  };

  const fetchOffers = async () => {
    try {
      const { data } = await api.get('offers');
      setStoredOffers(data);
    } catch (err) {
      console.error("Failed to fetch offers");
    }
  };

  const startCampaign = (name: string) => {
    setActiveCampaign(name);
    toast.success(`${name} is now LIVE on customer screens!`);
    
    // Broadcast via socket
    if (socket) {
      socket.emit('push_offer', { 
        title: name, 
        message: `Special Offer: ${name} is now available! Check the menu.`,
        type: 'PROMO'
      });
    }
  };

  const handlePushCustom = async () => {
    if (!flashMessage && !selectedItem && !isAnnouncement) return;
    try {
      const newOffer = { 
        title: isAnnouncement ? 'ANNOUNCEMENT 📢' : 'EXCLUSIVE OFFER 🎁', 
        message: flashMessage || (selectedItem ? `Get ${selectedItem.name} for just ₹${customRate || selectedItem.price}!` : ''),
        image: customImage || selectedItem?.image || '',
        rate: customRate || selectedItem?.price || '',
        type: isAnnouncement ? 'ANNOUNCEMENT' : 'CUSTOM',
        itemId: selectedItem?._id || null,
        isActive: true // Auto-activate on push
      };

      await api.post('offers', newOffer);
      toast.success(isAnnouncement ? "Announcement pushed & saved!" : "Offer pushed & saved!");
      toast.success("Alert msg sent to customers! 📱");
      
      // Cleanup
      setFlashMessage('');
      setSelectedItem(null);
      setCustomRate('');
      setCustomImage('');
      fetchOffers();
    } catch (err) {
      toast.error("Failed to save and push offer");
    }
  };

  const toggleOffer = async (id: string, currentStatus: boolean) => {
    try {
      await api.put(`offers/${id}`, { isActive: !currentStatus });
      toast.success(`Offer ${!currentStatus ? 'Activated' : 'Deactivated'}`);
      if (!currentStatus) {
        toast.success("Alert msg sent to customers! 📱");
      }
      fetchOffers();
    } catch (err) {
      toast.error("Status toggle failed");
    }
  };

  const deleteOffer = async (id: string) => {
    try {
      await api.delete(`offers/${id}`);
      toast.success("Offer deleted");
      fetchOffers();
    } catch (err) {
      toast.error("Delete failed");
    }
  };
  
  const handleSendWhatsAppBroadcast = async () => {
    if (!broadcastMessage) return toast.error("Please enter a message");
    if (broadcastTarget === 'specific' && !targetPhone) return toast.error("Please enter a phone number");

    setWaLoading(true);
    try {
      const payload = {
        message: broadcastMessage,
        target: broadcastTarget,
        phone: broadcastTarget === 'specific' ? targetPhone : null
      };

      const { data } = await api.post('marketing/broadcast', payload);
      if (data.failed > 0) {
        toast.info(`Broadcast complete: ${data.count} sent, ${data.failed} failed. Check Whapi dashboard!`);
      } else {
        toast.success(`Broadcasting to ${data.count || 1} contact(s)! 🚀`);
      }
      setBroadcastMessage('');
      if (broadcastTarget === 'specific') setTargetPhone('');
    } catch (err: any) {
      console.error("WA BLAST ERROR:", err);
      toast.error(err.response?.data?.error || "Failed to send WhatsApp broadcast");
    } finally {
      setWaLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">AI & Marketing</h1>
            <p className="text-gray-400 mt-1 font-medium italic">Boost sales with smart promotions and AI upselling</p>
          </div>
          
          <div className={`p-1 rounded-2xl border-2 transition-all flex items-center gap-2 px-4 py-2 ${aiEnabled ? 'bg-orange-50 border-orange-500/20 text-orange-600' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
             <div className="relative">
                <Bot size={20} />
                {aiEnabled && <Sparkles size={10} className="absolute -top-1 -right-1 animate-pulse" />}
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest leading-none">AI Engine {aiEnabled ? 'Active' : 'Offline'}</span>
             <button 
               onClick={() => setAiEnabled(!aiEnabled)}
               className={`w-10 h-5 rounded-full relative transition-all ${aiEnabled ? 'bg-orange-500' : 'bg-gray-300'}`}
             >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${aiEnabled ? 'left-6' : 'left-1'}`} />
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
           {/* Smart Promotions */}
           <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                 <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl"><Megaphone size={24} /></div>
                 <h2 className="text-2xl font-black text-gray-800 italic tracking-tighter">Live Promotions</h2>
              </div>
              
              <div className="space-y-4 flex-1">
                 {[
                   { name: "Happy Hour Blast", desc: "Show 20% off on all Drinks to active users", icon: Zap, color: "text-blue-500", bg: "bg-blue-50" },
                   { name: "Dinner Special Push", desc: "Highlight 'Special Thali' on top of menu", icon: Target, color: "text-purple-500", bg: "bg-purple-50" },
                   { name: "Flash Stock Clear", desc: "Promote items with stock > 20 immediately", icon: Zap, color: "text-orange-500", bg: "bg-orange-50" },
                 ].map((camp, i) => (
                   <div key={i} className="p-6 rounded-3xl border border-gray-50 hover:border-orange-200 transition-all group flex items-start gap-4">
                      <div className={`${camp.bg} ${camp.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                        <camp.icon size={24} />
                      </div>
                      <div className="flex-1">
                         <h3 className="font-black text-gray-800 tracking-tight uppercase text-sm">{camp.name}</h3>
                         <p className="text-xs text-gray-400 font-medium mt-1 italic">{camp.desc}</p>
                      </div>
                      <button 
                        onClick={() => startCampaign(camp.name)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                          activeCampaign === camp.name ? 'bg-green-500 text-white border-green-500' : 'bg-white text-gray-400 border-gray-100 hover:bg-gray-50'
                        }`}
                      >
                         {activeCampaign === camp.name ? 'LIVE' : 'ACTIVATE'}
                      </button>
                   </div>
                 ))}
              </div>
           </div>

           {/* AI Recommendations Settings */}
           <div className="bg-gray-900 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
              <Bot className="absolute -right-20 -bottom-20 text-gray-800 opacity-20" size={300} />
              
              <div className="flex items-center gap-3 mb-8 relative z-10">
                 <div className="bg-orange-600 text-white p-3 rounded-2xl"><Sparkles size={24} /></div>
                 <h2 className="text-2xl font-black text-white italic tracking-tighter">AI Upsell Engine</h2>
              </div>
              
              <p className="text-gray-400 text-sm font-medium italic mb-10 relative z-10 leading-relaxed">
                The AI analyzes customer cart patterns to suggest side-dishes and drinks at checkout. 
                Currently increasing Average Order Value (AOV) by 14.2%.
              </p>

              <div className="space-y-6 relative z-10">
                 {[
                   "Smart Drink Pairing",
                   "Dynamic Popularity Sorting",
                   "Inventory-Based Availability",
                   "Personalized Voice Suggestions"
                 ].map((opt, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                      <span className="font-bold text-gray-300 text-xs uppercase tracking-widest">{opt}</span>
                      <div className="w-10 h-5 bg-orange-600 rounded-full flex items-center px-1">
                         <div className="w-3 h-3 bg-white rounded-full ml-auto" />
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Custom Flash Notification Composer */}
        <div className="bg-orange-600 p-10 rounded-[4rem] shadow-2xl shadow-orange-200/50 mb-10 relative overflow-hidden group">
           <Zap className="absolute -right-10 -top-10 text-white opacity-10 group-hover:rotate-12 transition-transform" size={240} />
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-white/20 p-3 rounded-2xl text-white"><Bell size={24} /></div>
                 <h2 className="text-3xl font-black text-white italic tracking-tighter">Flash Notification Composer</h2>
              </div>
              <p className="text-orange-100 font-medium italic mb-8 max-w-xl">Type a message below to instantly "FLASH" an offer on every customer's screen. Perfect for clearing stock or last-minute combos!</p>
              
              <div className="flex items-center gap-6 mb-8">
                 <button 
                  onClick={() => setIsAnnouncement(false)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${!isAnnouncement ? 'bg-white text-orange-600 shadow-xl' : 'text-orange-100 hover:bg-white/10'}`}
                 >
                   ITEM OFFER
                 </button>
                 <button 
                  onClick={() => setIsAnnouncement(true)}
                  className={`px-6 py-3 rounded-2xl text-xs font-black transition-all ${isAnnouncement ? 'bg-white text-orange-600 shadow-xl' : 'text-orange-100 hover:bg-white/10'}`}
                 >
                   GENERAL ANNOUNCEMENT
                 </button>
              </div>

              {!isAnnouncement ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-orange-100 uppercase tracking-widest ml-4">Select Food Item</label>
                       <select 
                         className="w-full bg-white p-6 rounded-3xl outline-none border-none font-bold text-gray-800 shadow-xl appearance-none"
                         onChange={(e) => {
                            const item = menuItems.find(m => m._id === e.target.value);
                            setSelectedItem(item);
                            if (item) setCustomRate(item.price);
                         }}
                         value={selectedItem?._id || ''}
                       >
                         <option value="">Choose a dish...</option>
                         {menuItems.map(item => (
                           <option key={item._id} value={item._id}>{item.name}</option>
                         ))}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-orange-100 uppercase tracking-widest ml-4">Special Offer Price (₹)</label>
                       <input 
                         type="number" 
                         placeholder="Override price..."
                         className="w-full bg-white p-6 rounded-3xl outline-none border-none font-bold text-gray-800 shadow-xl"
                         value={customRate}
                         onChange={e => setCustomRate(e.target.value)}
                       />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-orange-100 uppercase tracking-widest ml-4">Custom Message (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Weekend Special! Grab it before it's gone!"
                      className="w-full bg-white p-6 rounded-3xl outline-none border-none font-bold text-gray-800 shadow-xl"
                      value={flashMessage}
                      onChange={e => setFlashMessage(e.target.value)}
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-orange-100 uppercase tracking-widest ml-4">Announcement Message</label>
                      <input 
                        type="text" 
                        placeholder="e.g., Happy Pongal to all our customers! Enjoy festive treats! 🌾"
                        className="w-full bg-white p-6 rounded-3xl outline-none border-none font-bold text-gray-800 shadow-xl"
                        value={flashMessage}
                        onChange={e => setFlashMessage(e.target.value)}
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-orange-100 uppercase tracking-widest ml-4">Custom Image URL (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="https://... (Festive Banner Image)"
                        className="w-full bg-white p-6 rounded-3xl outline-none border-none font-bold text-gray-800 shadow-xl"
                        value={customImage}
                        onChange={e => setCustomImage(e.target.value)}
                      />
                   </div>
                </div>
              )}

              <div className="mt-10 flex justify-end">
                <button 
                   onClick={handlePushCustom}
                   className="bg-gray-900 text-white px-12 py-6 rounded-3xl font-black uppercase tracking-widest hover:bg-black active:scale-95 transition-all flex items-center justify-center gap-4 shadow-2xl"
                 >
                   <Send size={24} /> PUSH TO ALL SCREENS
                 </button>
              </div>
           </div>
        </div>

        {/* WhatsApp Marketing Suite */}
        <div className="bg-zinc-900 p-10 rounded-[4rem] shadow-2xl mb-10 relative overflow-hidden group border border-white/5">
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-green-500 p-3 rounded-2xl text-black"><MessageSquare size={24} /></div>
                 <h2 className="text-3xl font-black text-white italic tracking-tighter">WhatsApp Marketing Suite</h2>
              </div>
              <p className="text-gray-400 font-medium italic mb-8 max-w-xl">Send direct WhatsApp messages to your customers. Perfect for festive greetings, personalized jokes, and discount blasts.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Campaign Target</label>
                    <div className="flex gap-4">
                       <button 
                        onClick={() => setBroadcastTarget('all')}
                        className={`flex-1 py-4 border rounded-2xl text-xs font-bold transition-all ${broadcastTarget === 'all' ? 'bg-green-500 text-black border-green-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>ALL CUSTOMERS</button>
                       <button 
                        onClick={() => setBroadcastTarget('specific')}
                        className={`flex-1 py-4 border rounded-2xl text-xs font-bold transition-all ${broadcastTarget === 'specific' ? 'bg-green-500 text-black border-green-500' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>SPECIFIC USER</button>
                    </div>
                    {broadcastTarget === 'specific' && (
                      <input 
                        type="text" 
                        placeholder="Enter phone number (e.g., +91...)"
                        className="w-full bg-white/5 p-5 rounded-2xl outline-none border border-white/10 text-white font-bold text-sm focus:border-green-500 transition-all"
                        value={targetPhone}
                        onChange={(e) => setTargetPhone(e.target.value)}
                      />
                    )}
                 </div>
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-4">Broadcast Message</label>
                    <textarea 
                      rows={4}
                      placeholder="Type your WhatsApp blast here..."
                      className="w-full bg-white/5 p-5 rounded-2xl outline-none border border-white/10 text-white font-bold text-sm focus:border-green-500 transition-all font-mono"
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                    ></textarea>
                 </div>
              </div>

              <div className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                 <div className="flex gap-6">
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-gray-500 uppercase">Automated Jokes</span>
                       <span className="text-[10px] font-bold text-green-500">ENABLED (11:00 AM)</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-gray-500 uppercase">5-Day Return Blast</span>
                       <span className="text-[10px] font-bold text-green-500">ENABLED (05:00 PM)</span>
                    </div>
                 </div>
                 <button 
                  onClick={handleSendWhatsAppBroadcast}
                  disabled={waLoading}
                  className="bg-green-500 text-black px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-400 active:scale-95 transition-all shadow-[0_0_40px_rgba(34,197,94,0.3)] disabled:opacity-50">
                    {waLoading ? 'SENDING...' : 'SEND WHATSAPP BLAST'}
                 </button>
              </div>
           </div>
           <MessageSquare size={300} className="absolute -right-20 -bottom-20 text-white/5 pointer-events-none" />
        </div>

        {/* Stored Offer Management */}
        <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100 mb-10">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="bg-orange-100 text-orange-600 p-3 rounded-2xl"><Save size={24} /></div>
                 <h2 className="text-2xl font-black text-gray-800 italic tracking-tighter">Stored Offer Management</h2>
              </div>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {storedOffers.map((offer) => (
                <div key={offer._id} className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col ${offer.isActive ? 'border-orange-500 bg-orange-50/10' : 'border-gray-100 bg-white'}`}>
                   <div className="flex justify-between items-start mb-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${offer.type === 'ANNOUNCEMENT' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'}`}>
                        {offer.type}
                      </span>
                      <button onClick={() => deleteOffer(offer._id)} className="text-gray-300 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
                   </div>
                   
                   {offer.image && <img src={offer.image} className="w-full h-24 object-cover rounded-2xl mb-4 border border-gray-100" />}
                   
                   <h3 className="font-black text-gray-800 tracking-tight text-sm mb-1 uppercase leading-tight">{offer.title}</h3>
                   <p className="text-xs text-gray-400 font-medium italic line-clamp-2 mb-6 flex-1">{offer.message}</p>
                   
                   <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest ${offer.isActive ? 'text-green-600' : 'text-gray-400'}`}>
                          {offer.isActive ? 'LIVE NOW' : 'OFFLINE'}
                        </p>
                      </div>
                      <button 
                        onClick={() => toggleOffer(offer._id, offer.isActive)}
                        className={`w-12 h-6 rounded-full relative transition-all ${offer.isActive ? 'bg-orange-500' : 'bg-gray-200'}`}
                      >
                         <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${offer.isActive ? 'right-0.5' : 'left-0.5'} shadow-sm`} />
                      </button>
                   </div>
                </div>
              ))}
              
              {storedOffers.length === 0 && (
                <div className="col-span-full py-20 text-center opacity-20 italic font-bold text-gray-400">
                  No stored offers yet. Create one above!
                </div>
              )}
           </div>
        </div>

        {/* Customer Engagement Simulation */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
           <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <div className="bg-blue-100 text-blue-600 p-3 rounded-2xl"><MessageSquare size={24} /></div>
                 <h2 className="text-2xl font-black text-gray-800 italic tracking-tighter">Engagement Feed</h2>
              </div>
              <button className="text-[10px] font-black uppercase text-gray-400 tracking-widest hover:text-orange-500 transition-all">Export Report</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { user: "User 9281", action: "Used Voice Search to find 'Spicy Chicken'", time: "2m ago", icon: <Bot size={14} /> },
                { user: "User 1102", action: "Claimed Happy Hour coupon", time: "15m ago", icon: <Megaphone size={14} /> },
                { user: "User 4492", action: "Added AI-recommended Drink to cart", time: "1h ago", icon: <Sparkles size={14} /> },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 hover:scale-105 transition-all">
                   <div className="flex justify-between items-start mb-4">
                      <div className="text-gray-300">{item.icon}</div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.time}</span>
                   </div>
                   <p className="font-black text-gray-800 text-xs mb-1 uppercase opacity-40">{item.user}</p>
                   <p className="font-bold text-gray-600 text-sm italic leading-relaxed">"{item.action}"</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

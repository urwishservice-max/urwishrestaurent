"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Settings, Save, MapPin, Power, Clock, Image as ImageIcon, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data } = await api.get('/restaurants');
      setConfig(data);
    } catch (err) {
      toast.error("Failed to load settings");
    }
  };

  const handleSave = async () => {
    if (!config?._id) return;
    setLoading(true);
    try {
      await api.put(`/restaurants/${config._id}`, config);
      toast.success("Restaurant settings updated successfully!");
    } catch (err) {
      toast.error("Failed to save settings to server");
    } finally {
      setLoading(false);
    }
  };

  if (!config) return <div className="p-8">Loading settings...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-800">Restaurant Settings</h1>
            <p className="text-gray-400 mt-1">Manage your identity, operations, and safety</p>
          </div>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="bg-orange-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 transition-all shadow-lg shadow-orange-100 disabled:opacity-50"
          >
            <Save size={20} /> {loading ? "SAVING..." : "SAVE ALL CHANGES"}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identity Section */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 text-gray-400">
              <Settings size={20} />
              <h2 className="font-bold uppercase tracking-widest text-xs">Identity</h2>
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">Restaurant Name</label>
              <input 
                type="text" 
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                value={config.name}
                onChange={e => setConfig({...config, name: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">Logo URL</label>
              <div className="flex gap-3">
                <input 
                  type="text" 
                  className="flex-1 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  value={config.logo}
                  onChange={e => setConfig({...config, logo: e.target.value})}
                  placeholder="https://..."
                />
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200">
                  {config.logo ? <img src={config.logo} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" />}
                </div>
              </div>
            </div>
          </div>

          {/* Operations Section */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 text-gray-400">
              <Power size={20} />
              <h2 className="font-bold uppercase tracking-widest text-xs">Operations</h2>
            </div>

            <div className={`p-5 rounded-3xl flex items-center justify-between transition-all ${config.isOpen ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
               <div>
                  <p className={`font-black ${config.isOpen ? 'text-green-700' : 'text-red-700'}`}>
                    {config.isOpen ? 'RESTAURANT IS OPEN' : 'RESTAURANT IS CLOSED'}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Manual Override</p>
               </div>
               <button 
                 onClick={() => setConfig({...config, isOpen: !config.isOpen})}
                 className={`w-14 h-8 rounded-full relative transition-all ${config.isOpen ? 'bg-green-500' : 'bg-gray-300'}`}
               >
                 <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${config.isOpen ? 'right-1' : 'left-1'}`} />
               </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1">
                  <Clock size={12} /> OPENING
                </label>
                <input 
                  type="time" 
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                  value={config.openingTime}
                  onChange={e => setConfig({...config, openingTime: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 ml-1 flex items-center gap-1">
                  <Clock size={12} /> CLOSING
                </label>
                <input 
                  type="time" 
                  className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                  value={config.closingTime}
                  onChange={e => setConfig({...config, closingTime: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 text-gray-400">
              <MapPin size={20} />
              <h2 className="font-bold uppercase tracking-widest text-xs">Security Location</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Lat</label>
                 <input 
                   type="number" 
                   className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                   value={config.location.lat}
                   onChange={e => setConfig({...config, location: {...config.location, lat: parseFloat(e.target.value)}})}
                 />
               </div>
               <div>
                 <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase">Lng</label>
                 <input 
                   type="number" 
                   className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                   value={config.location.lng}
                   onChange={e => setConfig({...config, location: {...config.location, lng: parseFloat(e.target.value)}})}
                 />
               </div>
            </div>
            <button 
              onClick={() => {
                navigator.geolocation.getCurrentPosition(pos => {
                  setConfig({...config, location: { lat: pos.coords.latitude, lng: pos.coords.longitude }});
                  toast.success("Location updated to your current position!");
                });
              }}
              className="w-full py-4 text-xs font-bold text-orange-600 hover:bg-orange-50 rounded-2xl transition-all"
            >
              SYNC WITH MY CURRENT LOCATION
            </button>
          </div>

          {/* Messaging Section */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 space-y-6">
            <div className="flex items-center gap-3 text-gray-400">
              <MessageSquare size={20} />
              <h2 className="font-bold uppercase tracking-widest text-xs">Customer Messages</h2>
            </div>
            
            <div className="space-y-4">
              <label className="block text-sm font-bold text-gray-700">Closed Message</label>
              <textarea 
                rows={3}
                className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium"
                value={config.closedMessage}
                onChange={e => setConfig({...config, closedMessage: e.target.value})}
              />
               <p className="text-[10px] text-gray-400 uppercase font-black tracking-tighter">This will show when the restaurant is closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

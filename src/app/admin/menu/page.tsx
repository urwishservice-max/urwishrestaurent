"use client";

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Edit2, Trash2, Check, X, Image as ImageIcon, List, Zap, Clock, Heart } from 'lucide-react';
import { toast } from 'sonner';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminMenuPage() {
  const [menu, setMenu] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({ 
    name: '', price: '', category: '', image: '', stock: 10, 
    description: '', isVisible: true, isAvailable: true,
    isFeatured: false, isFavourite: false, isTodaysSpecial: false 
  });
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const { data } = await api.get('menu');
      setMenu(data);
    } catch (err) {
      toast.error("Failed to load menu");
    }
  };

  const handleSave = async (id?: string, partialData?: any) => {
    try {
      if (id) {
        await api.put(`menu/${id}`, partialData || formData);
        toast.success("Item updated");
        setIsEditing(null);
      } else {
        await api.post('menu', formData);
        toast.success("Item added");
        setShowAddForm(false);
      }
      fetchMenu();
      if (!partialData) {
        setFormData({ 
          name: '', price: '', category: '', image: '', stock: 10, 
          description: '', isVisible: true, isAvailable: true,
          isFeatured: false, isFavourite: false, isTodaysSpecial: false 
        });
      }
    } catch (err) {
      toast.error("Save failed");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`menu/${id}`);
      toast.success("Item deleted");
      fetchMenu();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const toggleAvailability = async (item: any) => {
    try {
      await api.put(`menu/${item._id}`, { isAvailable: !item.isAvailable });
      fetchMenu();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />

      <div className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">Menu Management</h1>
            <p className="text-gray-400 mt-1">Curate your dishes and manage promotions</p>
          </div>
          <button 
            onClick={() => {
              setFormData({ 
                name: '', price: '', category: 'Lunch', image: '', stock: 10, 
                description: '', isVisible: true, isAvailable: true,
                isFeatured: false, isFavourite: false, isTodaysSpecial: false 
              });
              setIsEditing(null);
              setShowAddForm(true);
            }}
            className="bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-orange-100 flex items-center justify-center gap-2 hover:bg-orange-700 active:scale-95 transition-all"
          >
            <Plus size={20} /> ADD MASTER DISH
          </button>
        </header>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item details</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Control</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Promotion Tags</th>
                  <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {menu.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50/80 transition-all group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                          {item.image ? (
                            <img src={item.image} className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-gray-100" />
                          ) : (
                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-300 border border-dashed border-gray-200">
                              <ImageIcon size={20} />
                            </div>
                          )}
                          {!item.isVisible && (
                            <div className="absolute -top-2 -right-2 bg-gray-900 text-white p-1 rounded-full shadow-lg border border-gray-700">
                              <X size={10} strokeWidth={4} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-gray-800 block truncate">{item.name}</span>
                          <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest truncate max-w-[150px] block mt-0.5">
                            {item.description || 'No description added'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                       <span className="text-[11px] font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-lg uppercase tracking-wider">{item.category}</span>
                    </td>
                    <td className="p-6">
                      <p className="font-black text-gray-800 text-lg">₹{item.price}</p>
                    </td>
                    <td className="p-6">
                       <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight ${item.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                        {item.stock} UNITS
                       </span>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1.5 min-w-[100px]">
                        <button 
                          onClick={() => toggleAvailability(item)}
                          className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full text-center transition-all ${
                            item.isAvailable ? 'bg-green-500 text-white shadow-lg shadow-green-100' : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {item.isAvailable ? 'Available' : 'Sold Out'}
                        </button>
                        <button 
                          onClick={() => handleSave(item._id, { isVisible: !item.isVisible })}
                          className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full text-center transition-all ${
                            item.isVisible ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-gray-900 text-gray-400'
                          }`}
                        >
                          {item.isVisible ? 'ACTIVE' : 'HIDDEN'}
                        </button>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {item.isFeatured && <span className="text-[9px] font-black bg-orange-100 text-orange-600 px-2 py-0.5 rounded-md uppercase tracking-tighter">⭐ Featured</span>}
                        {item.isFavourite && <span className="text-[9px] font-black bg-pink-100 text-pink-600 px-2 py-0.5 rounded-md uppercase tracking-tighter">❤️ Fav</span>}
                        {item.isTodaysSpecial && <span className="text-[9px] font-black bg-purple-100 text-purple-600 px-2 py-0.5 rounded-md uppercase tracking-tighter">🚀 Special</span>}
                        {(!item.isFeatured && !item.isFavourite && !item.isTodaysSpecial) && <span className="text-[9px] font-bold text-gray-300 italic">None</span>}
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-[-10px]">
                        <button onClick={() => { setIsEditing(item._id); setFormData(item); setShowAddForm(true); }} className="p-3 text-gray-400 hover:text-orange-600 transition-all hover:bg-orange-50 rounded-2xl"><Edit2 size={20} /></button>
                        <button onClick={() => handleDelete(item._id)} className="p-3 text-gray-400 hover:text-red-600 transition-all hover:bg-red-50 rounded-2xl"><Trash2 size={20} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {menu.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-20 text-center">
                       <div className="flex flex-col items-center gap-4">
                          <List className="text-gray-200" size={64} />
                          <p className="font-bold text-gray-400 text-xl italic">Your menu is empty. Start adding delicious items!</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Professional Menu Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-4 flex justify-between items-center border-b border-gray-100">
               <div>
                  <h2 className="text-2xl font-black text-gray-800">{isEditing ? 'Edit Dish' : 'Add New Dish'}</h2>
                  <p className="text-sm text-gray-400 font-medium">Configure all item properties and promotions</p>
               </div>
               <button onClick={() => setShowAddForm(false)} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-400 transition-all"><X size={24} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[70vh] space-y-8 no-scrollbar">
              {/* Basic Details */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Dish Name</label>
                  <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} placeholder="e.g. Butter Chicken" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Price (₹)</label>
                  <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold" type="number" value={formData.price} onChange={e=>setFormData({...formData, price:e.target.value})} placeholder="299" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                  <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%236b7280%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat" value={formData.category} onChange={e=>setFormData({...formData, category:e.target.value})}>
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Snacks">Snacks</option>
                    <option value="Drinks">Drinks</option>
                    <option value="Dinner">Dinner</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Initial Stock</label>
                  <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 font-bold" type="number" value={formData.stock} onChange={e=>setFormData({...formData, stock:e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Image URL</label>
                <div className="flex gap-4">
                   <input className="flex-1 p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium" value={formData.image} onChange={e=>setFormData({...formData, image:e.target.value})} placeholder="https://..." />
                   <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-dashed border-gray-200 shrink-0 overflow-hidden">
                      {formData.image ? <img src={formData.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" />}
                   </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Description</label>
                <textarea rows={2} className="w-full p-4 bg-gray-50 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium" value={formData.description} onChange={e=>setFormData({...formData, description:e.target.value})} placeholder="Tell customers about this dish..." />
              </div>

              {/* Promotions Checkboxes */}
              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Marketing & Promotions</label>
                <div className="grid grid-cols-3 gap-4">
                  <button onClick={() => setFormData({...formData, isFeatured: !formData.isFeatured})} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.isFeatured ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-white border-gray-100 text-gray-400'}`}>
                    <Zap size={20} /> <span className="text-[9px] font-black uppercase">Featured</span>
                  </button>
                  <button onClick={() => setFormData({...formData, isFavourite: !formData.isFavourite})} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.isFavourite ? 'bg-pink-50 border-pink-500 text-pink-700' : 'bg-white border-gray-100 text-gray-400'}`}>
                    <Heart size={20} /> <span className="text-[9px] font-black uppercase">Favorite</span>
                  </button>
                  <button onClick={() => setFormData({...formData, isTodaysSpecial: !formData.isTodaysSpecial})} className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${formData.isTodaysSpecial ? 'bg-purple-50 border-purple-500 text-purple-700' : 'bg-white border-gray-100 text-gray-400'}`}>
                    <Clock size={20} /> <span className="text-[9px] font-black uppercase">Today's Special</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex gap-4">
               <button onClick={() => setShowAddForm(false)} className="flex-1 p-5 rounded-3xl font-bold bg-white text-gray-400 hover:bg-gray-100 transition-all uppercase tracking-widest text-sm">Cancel</button>
               <button onClick={() => handleSave(isEditing || undefined)} className="flex-[2] p-5 rounded-3xl font-bold bg-orange-600 text-white hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all uppercase tracking-widest text-sm">
                 {isEditing ? 'COMMIT UPDATES' : 'PUBLISH DISH'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

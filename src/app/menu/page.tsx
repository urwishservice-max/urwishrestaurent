"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import { ShoppingBag, ShoppingBasket, Search, Plus, Minus, User, Cake } from 'lucide-react';
import Anotbot from '@/components/Anotbot';
import VoiceSearch from '@/components/VoiceSearch';
import OfferPopup from '@/components/OfferPopup';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function MenuPage() {
  const router = useRouter();
  const [menu, setMenu] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [showOffer, setShowOffer] = useState(false);
  
  const { user } = useAuth();
  const { cart, addToCart, updateQuantity, totalAmount, tableNumber } = useCart();
  const [localQty, setLocalQty] = useState<{[key: string]: number}>({});

  useEffect(() => {
    fetchMenu();
    
    // DELAYED OFFER: Show after 7 seconds
    const offerTimer = setTimeout(() => {
      fetchActiveOffer();
    }, 7000);

    return () => clearTimeout(offerTimer);
  }, []);

  const fetchActiveOffer = async () => {
    try {
      const { data } = await api.get('offers/active');
      if (data && data.isActive) {
        setActiveOffer(data);
        setShowOffer(true);
      }
    } catch (err) {
      console.error("Failed to fetch offer:", err);
    }
  };

  const fetchMenu = async () => {
    try {
      const { data } = await api.get('menu');
      setMenu(data);
      const cats = ['All', ...new Set(data.map((item: any) => item.category))];
      setCategories(cats as string[]);
    } catch (err) {
      toast.error("Failed to load menu");
    } finally {
      setLoading(false);
    }
  };

  const [isAiSearching, setIsAiSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length > 2) {
        handleSearch();
      }
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = async () => {
    // If it's just a few characters, local filter is enough
    if (searchTerm.length <= 2) return;

    // Check if we need AI help (e.g., contains non-English chars or no local results)
    const hasNonEnglish = /[^\x00-\x7F]+/.test(searchTerm);
    const localResults = menu.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (hasNonEnglish || localResults.length === 0) {
      setIsAiSearching(true);
      try {
        const { data } = await api.post('menu/search', { query: searchTerm });
        if (data.length > 0) {
          setMenu(data);
          toast.success(`Found ${data.length} items using AI Search!`);
        } else {
          toast.info("No items found even with AI search.");
        }
      } catch (err) {
        console.error("AI Search Failed");
      } finally {
        setIsAiSearching(false);
      }
    }
  };

  const handleResetSearch = () => {
    setSearchTerm('');
    fetchMenu();
  };

  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    // If it's an AI search result, we already have the specific items in 'menu' state,
    // but the local filter might hide them if the searchTerm doesn't literally match.
    // So we'll bypass local name filtering if the user is using the AI search results.
    const matchesSearch = isAiSearching ? true : item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading yummy food...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Urwish Restaurant</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500">Welcome, {user?.name || 'Guest'} (Table {tableNumber || '?'})</p>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => router.push('/admin')}
                  className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded font-black uppercase tracking-tighter hover:bg-orange-600 hover:text-white transition-colors"
                >
                  Admin Dash
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <VoiceSearch onTranscript={setSearchTerm} />
            <button 
              onClick={() => router.push('/profile')}
              className="p-2.5 bg-gray-100 rounded-2xl text-gray-600 hover:bg-orange-500 hover:text-white transition-all shadow-sm"
              title="My Profile"
            >
              <User size={20} />
            </button>
            <div className="relative">
              <button 
                onClick={() => router.push('/checkout')}
                className="p-2.5 bg-orange-500 rounded-2xl text-white hover:bg-orange-600 transition-all shadow-md shadow-orange-100"
                title="My Basket"
              >
                <ShoppingBasket size={20} />
              </button>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cart.length}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="max-w-5xl mx-auto mt-4 relative">
          <Search className={`absolute left-4 top-3.5 ${isAiSearching ? 'text-orange-500 animate-spin' : 'text-gray-400'}`} size={18} />
          <input 
            type="text" 
            placeholder="Search for dishes (Try Tamil or typos!)..." 
            className="w-full pl-12 pr-16 py-3 bg-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-orange-500 transition-all font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              onClick={handleResetSearch}
              className="absolute right-4 top-3 text-xs font-bold text-orange-500 hover:text-orange-600 bg-white px-2 py-1 rounded-lg shadow-sm"
            >
              RESET
            </button>
          )}
        </div>
        {isAiSearching && (
          <div className="max-w-5xl mx-auto mt-2 flex items-center gap-2 px-2">
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
            <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-widest ml-1">AI Search is thinking...</span>
          </div>
        )}

        {/* Birthday Greeting */}
        {user?.dateOfBirth && (
          (() => {
            const today = new Date();
            const birthday = new Date(user.dateOfBirth);
            if (today.getMonth() === birthday.getMonth() && today.getDate() === birthday.getDate()) {
              return (
                <div className="max-w-5xl mx-auto mt-4 px-2">
                  <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <div className="relative z-10 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-md animate-bounce">
                             <Cake size={32} className="text-white" />
                          </div>
                          <div>
                             <h2 className="text-2xl font-black text-white italic tracking-tighter leading-tight">HAPPY BIRTHDAY, {user.name.toUpperCase()}! 🎂</h2>
                             <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">Enjoy a special treat on us today! 🎉🎈</p>
                          </div>
                       </div>
                       <div className="hidden md:flex gap-2">
                          <span className="text-4xl">🥳</span>
                          <span className="text-4xl animate-bounce [animation-delay:0.2s]">🍕</span>
                       </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()
        )}

        {/* Categories */}
        <div className="max-w-5xl mx-auto mt-4 flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all ${
                selectedCategory === cat ? 'bg-orange-500 text-white shadow-lg' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-5xl mx-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {filteredMenu.map((item) => (
          <div key={item._id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow border border-gray-100 group">
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              {item.image ? (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
              {!item.isAvailable && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="bg-white px-4 py-1 rounded-full text-xs font-bold text-red-600 uppercase tracking-widest">Sold Out</span>
                </div>
              )}
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                <span className="bg-orange-50 text-orange-600 px-2 py-1 rounded-lg text-sm font-bold">₹{item.price}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{item.description || "Freshly prepared delicious dish."}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 capitalize">{item.category}</span>
                {cart.find(i => i.menuId === item._id) ? (
                  <div className="flex items-center gap-3 bg-orange-500 text-white p-1 rounded-xl shadow-lg shadow-orange-100">
                    <button onClick={() => updateQuantity(item._id, cart.find(i => i.menuId === item._id)!.quantity - 1)} className="p-1.5 hover:bg-orange-600 rounded-lg transition-colors">
                      <Minus size={18} />
                    </button>
                    <span className="font-black min-w-[24px] text-center text-sm">{cart.find(i => i.menuId === item._id)!.quantity}</span>
                    <button onClick={() => updateQuantity(item._id, cart.find(i => i.menuId === item._id)!.quantity + 1)} className="p-1.5 hover:bg-orange-600 rounded-lg transition-colors">
                      <Plus size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                       <button 
                         onClick={() => setLocalQty(prev => ({ ...prev, [item._id]: Math.max(1, (prev[item._id] || 1) - 1) }))}
                         className="p-1.5 text-gray-500 hover:text-orange-500"
                        >
                          <Minus size={14} />
                       </button>
                       <span className="font-bold text-gray-700 min-w-[20px] text-center text-xs">
                         {localQty[item._id] || 1}
                       </span>
                       <button 
                         onClick={() => setLocalQty(prev => ({ ...prev, [item._id]: (prev[item._id] || 1) + 1 }))}
                         className="p-1.5 text-gray-500 hover:text-orange-500"
                       >
                          <Plus size={14} />
                       </button>
                    </div>
                    <button 
                      disabled={!item.isAvailable}
                      onClick={() => {
                        const qty = localQty[item._id] || 1;
                        addToCart({ 
                          menuId: item._id, 
                          name: item.name, 
                          price: Number(item.price), 
                          quantity: Number(qty) 
                        });
                        toast.success(`${qty} x ${item.name} added!`);
                        // Reset local qty
                        setLocalQty(prev => {
                          const next = { ...prev };
                          delete next[item._id];
                          return next;
                        });
                      }}
                      className="bg-orange-500 text-white font-black px-6 py-2.5 rounded-xl hover:bg-orange-600 transition-all shadow-md shadow-orange-100 uppercase italic tracking-tighter text-xs"
                    >
                      ADD
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Bot */}
      <Anotbot />

      {/* Offer Popup */}
      {showOffer && activeOffer && (
        <OfferPopup offer={activeOffer} onClose={() => setShowOffer(false)} />
      )}

      {/* Sticky Cart */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-6 right-6 max-w-lg mx-auto z-40 animate-in slide-in-from-bottom-10 duration-500">
          <button 
            onClick={() => router.push('/checkout')}
            className="w-full bg-black text-white p-5 rounded-3xl shadow-2xl flex items-center justify-between transform active:scale-95 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-xl">
                <ShoppingBag size={20} />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm leading-none">{cart.length} ITEMS</p>
                <p className="text-gray-400 text-xs mt-1">Total: ₹{totalAmount}</p>
              </div>
            </div>
            <span className="font-bold tracking-tight">VIEW CART →</span>
          </button>
        </div>
      )}
    </div>
  );
}

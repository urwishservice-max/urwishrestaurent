"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import api from '@/lib/api';
import { ShoppingBag, ChevronLeft, Trash2, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const { cart, totalAmount, removeFromCart, clearCart, tableNumber, setTableNumber } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tableInput, setTableInput] = useState('');
  const [restaurantLocation, setRestaurantLocation] = useState({ lat: 13.0827, lng: 80.2707 });

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371e3; // metres
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // in metres
  };

  const handlePlaceOrder = async () => {
    if (!user) return toast.error("Please log in first");
    
    const finalTable = tableNumber || tableInput;
    if (!finalTable) return toast.error("Please enter a Table Number to proceed.");
    
    setLoading(true);
    
    // Location Check
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const dist = calculateDistance(
          position.coords.latitude, 
          position.coords.longitude, 
          restaurantLocation.lat, 
          restaurantLocation.lng
        );
        if (dist > 5000) {
          setLoading(false);
          return toast.error("Ordering allowed only inside restaurant (100m radius)");
        }
        
        // Proceed if within distance
        await submitOrder();
      }, (err) => {
        setLoading(false);
        toast.error("Location access required for security.");
      });
    } else {
      await submitOrder();
    }
  };

  const submitOrder = async () => {
    const finalTable = tableNumber || tableInput;
    if (!tableNumber && tableInput) {
      setTableNumber(tableInput);
    }
    
    try {
      const { data } = await api.post('orders', {
        customer: { name: user.name, phone: user.phone },
        tableNumber: finalTable,
        items: cart,
        totalAmount
      });
      
      toast.success("Order placed successfully!");
      clearCart();
      router.push(`/orders/${data.order._id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <div className="bg-gray-100 p-8 rounded-full mb-6">
          <ShoppingBag size={64} className="text-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
        <p className="text-gray-500 mt-2 text-center max-w-xs">Add some delicious dishes to your cart to start ordering!</p>
        <button 
          onClick={() => router.push('/menu')}
          className="mt-8 bg-orange-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-orange-200"
        >
          GO TO MENU
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white p-4 sticky top-0 z-30 shadow-sm flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-xl">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-bold text-gray-800">Review Order</h1>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-6 mt-4">
        {/* Table Info */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 text-orange-600 mb-4">
            <MapPin size={20} />
            <span className="font-bold text-xs uppercase tracking-widest">Dining Information</span>
          </div>
          
          {tableNumber ? (
            <div className="flex justify-between items-end">
              <div>
                <p className="text-3xl font-black text-gray-800">Table {tableNumber}</p>
                <p className="text-xs text-gray-400 mt-1">Automatically detected from QR scan</p>
              </div>
              <button 
                onClick={() => {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setRestaurantLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    toast.success("Restaurant location updated to your current spot!");
                  });
                }}
                className="text-[10px] font-bold text-orange-500 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-all"
              >
                SET AS RESTAURANT
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">Enter Table Number</label>
              <input 
                type="text" 
                placeholder="e.g. 5, 12, A1"
                className="w-full p-4 bg-gray-50 rounded-2xl border-2 border-transparent focus:border-orange-500 outline-none font-bold text-xl transition-all"
                value={tableInput}
                onChange={(e) => setTableInput(e.target.value)}
              />
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Ask staff if you're unsure of your table number</p>
              
              <button 
                onClick={() => {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setRestaurantLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                    toast.success("Restaurant location updated to your current spot!");
                  });
                }}
                className="w-full mt-2 text-[10px] font-bold text-orange-500 border border-orange-100 py-3 rounded-xl hover:bg-orange-50 transition-all uppercase tracking-widest"
              >
                Set My Current Spot as Restaurant
              </button>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 divide-y">
          <div className="p-5">
            <h3 className="font-bold text-gray-800">Your Selection</h3>
          </div>
          {cart.map((item) => (
            <div key={item.menuId} className="p-5 flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center font-bold text-orange-600">
                  {item.quantity}x
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{item.name}</h4>
                  <p className="text-xs text-gray-400">₹{item.price} each</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-800">₹{item.price * item.quantity}</span>
                <button 
                  onClick={() => removeFromCart(item.menuId)}
                  className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Bill Details */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-3">
          <h3 className="font-bold text-gray-800 mb-2">Bill Summary</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Item Total</span>
            <span>₹{totalAmount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Service Fee</span>
            <span className="text-green-600 font-medium">FREE</span>
          </div>
          <div className="pt-3 border-t flex justify-between items-center">
            <span className="font-bold text-gray-800">To Pay</span>
            <span className="text-2xl font-black text-gray-800">₹{totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Place Order Button */}
      <div className="fixed bottom-6 left-6 right-6 max-w-2xl mx-auto z-40">
        <button 
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-orange-500 text-white p-5 rounded-3xl shadow-2xl shadow-orange-200 flex items-center justify-between transform active:scale-95 transition-all disabled:opacity-50"
        >
          <div className="text-left">
            <p className="font-bold text-sm">₹{totalAmount}</p>
            <p className="text-orange-100 text-xs">Final Amount</p>
          </div>
          <span className="font-bold tracking-tight">{loading ? "PLACING ORDER..." : "PLACE ORDER →"}</span>
        </button>
      </div>
    </div>
  );
}

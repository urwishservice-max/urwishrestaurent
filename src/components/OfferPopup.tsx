import React, { useEffect, useState } from 'react';
import { X, Sparkles, Tag, ArrowRight, Zap, Plus, Minus, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { toast } from 'sonner';

interface Offer {
  _id: string;
  title: string;
  message: string;
  image?: string;
  rate?: string;
  type: 'CUSTOM' | 'ANNOUNCEMENT';
  itemId?: {
    _id: string;
    name: string;
    price: number;
    image?: string;
  };
}

interface OfferPopupProps {
  offer: Offer;
  onClose: () => void;
}

export default function OfferPopup({ offer, onClose }: OfferPopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 500);
  };

  const handleClaim = () => {
    if (offer.itemId) {
      addToCart({
        menuId: offer.itemId._id,
        name: offer.itemId.name,
        price: Number(offer.rate) || offer.itemId.price,
        quantity: quantity
      });
      toast.success(`${quantity} x ${offer.itemId.name} added to cart! 🛒`);
    }
    handleClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/40 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotateX: 20 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotateX: -20 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="bg-zinc-900 rounded-[2.5rem] overflow-hidden max-w-lg w-full shadow-[0_32px_128px_rgba(0,0,0,0.5)] relative border border-white/10 group"
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

            {/* Close Button */}
            <button 
              onClick={handleClose}
              className="absolute top-6 right-6 z-50 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-xl transition-all text-white active:scale-95 border border-white/10"
            >
              <X size={18} />
            </button>

            <div className="flex flex-col h-full">
              {/* Image Section */}
              <div className="relative h-48 md:h-56 overflow-hidden">
                {offer.image ? (
                  <img 
                    src={offer.image} 
                    alt={offer.title} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-orange-600 to-yellow-500 flex items-center justify-center">
                    <Sparkles className="text-white size-16 animate-pulse" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                
                {/* Promo Badge */}
                <motion.div 
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-6 left-6 bg-orange-500 text-white px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-orange-500/40 flex items-center gap-2"
                >
                  <Zap size={12} fill="currentColor" /> {offer.type}
                </motion.div>
              </div>

              {/* Content Section */}
              <div className="p-8 md:p-10 flex flex-col justify-center relative bg-zinc-900 text-center">
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter mb-3 leading-none italic">
                    {offer.title}
                  </h2>
                  
                  <p className="text-zinc-400 font-bold text-base mb-6 leading-relaxed">
                    {offer.message}
                  </p>

                  {offer.rate && (
                    <div className="mb-6 flex items-baseline justify-center gap-2">
                       <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 tracking-tighter italic drop-shadow-sm">
                         {offer.rate}
                       </span>
                       <span className="text-xl font-black text-orange-400 uppercase tracking-tighter">OFF</span>
                    </div>
                  )}

                  {/* Quantity Selector */}
                  {offer.itemId && (
                    <div className="flex items-center justify-center gap-6 mb-8 bg-white/5 p-4 rounded-3xl border border-white/5">
                      <button 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white active:scale-90"
                      >
                        <Minus size={20} />
                      </button>
                      <span className="text-3xl font-black text-white w-12 text-center tabular-nums">
                        {quantity}
                      </span>
                      <button 
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl transition-all text-white active:scale-90"
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  )}

                  <button 
                    onClick={handleClaim}
                    className="w-full bg-white text-black py-5 rounded-3xl text-lg font-black shadow-[0_10px_40px_rgba(255,255,255,0.1)] flex items-center justify-center gap-3 hover:bg-orange-500 hover:text-white transition-all transform active:scale-95 group overflow-hidden relative"
                  >
                    <span className="relative z-10 flex items-center gap-2 uppercase tracking-tight">
                      {offer.itemId ? 'Add to Cart' : 'Claim Now'} <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                  
                  <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.3em] text-center mt-5 opacity-50">
                    * Limited time only
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

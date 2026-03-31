"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  menuId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (menuId: string) => void;
  updateQuantity: (menuId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  tableNumber: string | null;
  setTableNumber: (table: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [tableNumber, setTableNumber] = useState<string | null>(null);

  useEffect(() => {
    const savedTable = localStorage.getItem('tableNumber');
    if (savedTable) setTableNumber(savedTable);
  }, []);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuId === item.menuId);
      if (existing) {
        return prev.map((i) =>
          i.menuId === item.menuId ? { ...i, quantity: i.quantity + item.quantity } : i
        );
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (menuId: string) => {
    setCart((prev) => prev.filter((i) => i.menuId !== menuId));
  };

  const updateQuantity = (menuId: string, quantity: number) => {
    if (quantity <= 0) return removeFromCart(menuId);
    setCart((prev) =>
      prev.map((i) => (i.menuId === menuId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((acc, item) => acc + (Number(item.price) * Number(item.quantity)), 0);

  const _setTableNumber = (table: string) => {
    localStorage.setItem('tableNumber', table);
    setTableNumber(table);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalAmount,
        tableNumber,
        setTableNumber: _setTableNumber,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

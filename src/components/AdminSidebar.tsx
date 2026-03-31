"use client";

import React from 'react';
import { 
  LayoutGrid, 
  UtensilsCrossed, 
  ChefHat, 
  Settings as SettingsIcon, 
  BarChart3, 
  QrCode, 
  LogOut,
  Users,
  MessageSquare,
  ShieldCheck,
  Zap,
  Receipt
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

interface MenuItem {
  name: string;
  href: string;
  icon: React.ElementType;
  placeholder?: boolean;
}

const menuItems: MenuItem[] = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
  { name: 'Live Orders', href: '/admin/orders', icon: Receipt },
  { name: 'Menu Editor', href: '/admin/menu', icon: UtensilsCrossed },
  { name: 'Kitchen View', href: '/admin/kitchen', icon: ChefHat },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { name: 'QR Codes', href: '/admin/qr', icon: QrCode },
  { name: 'Marketing & AI', href: '/admin/marketing', icon: MessageSquare },
  { name: 'Settings', href: '/admin/settings', icon: SettingsIcon },
];

export default function AdminSidebar() {
  const { logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="w-64 bg-gray-900 p-6 flex flex-col gap-8 hidden lg:flex shrink-0 h-screen sticky top-0 overflow-y-auto no-scrollbar">
      <div className="flex items-center gap-3 text-white">
        <div className="bg-orange-500 p-2 rounded-xl">
          <UtensilsCrossed size={20} />
        </div>
        <span className="font-bold text-lg tracking-tight">Urwish Admin</span>
      </div>

      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.placeholder ? '#' : item.href}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all group ${
                isActive 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-900/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              } ${item.placeholder ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={(e) => item.placeholder && e.preventDefault()}
            >
              <div className="flex items-center gap-3">
                <Icon size={18} />
                <span className="font-medium text-sm">{item.name}</span>
              </div>
              {item.placeholder && (
                <span className="text-[8px] font-black bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded border border-gray-700">SOON</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-gray-800">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 p-3 text-red-400 hover:text-red-300 hover:bg-red-400/5 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}

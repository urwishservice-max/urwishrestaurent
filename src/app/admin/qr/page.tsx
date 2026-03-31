"use client";

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  Download, 
  Printer, 
  Plus, 
  Trash2, 
  Layers,
  ExternalLink,
  Table as TableIcon
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { toast } from 'sonner';

export default function AdminQRPage() {
  const [tables, setTables] = useState<number[]>(Array.from({ length: 5 }, (_, i) => i + 1));
  const [newTable, setNewTable] = useState('');
  
  // Use current URL for QR (will point to http://localhost:3000?table=X in dev)
  const baseUrl = typeof window !== 'undefined' ? `${window.location.origin}` : '';

  const addTable = () => {
    const num = parseInt(newTable);
    if (!isNaN(num) && !tables.includes(num)) {
      setTables([...tables, num].sort((a, b) => a - b));
      setNewTable('');
      toast.success(`Table ${num} added`);
    }
  };

  const removeTable = (num: number) => {
    setTables(tables.filter(t => t !== num));
    toast.info(`Table ${num} removed`);
  };

  const downloadQR = (tableNum: number) => {
    const svg = document.getElementById(`qr-table-${tableNum}`);
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const svgSize = svg.getBoundingClientRect();
    canvas.width = svgSize.width * 2;
    canvas.height = svgSize.height * 2;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `QR_Table_${tableNum}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">QR Management</h1>
            <p className="text-gray-400 mt-1 font-medium italic">Generate scanning codes for every table</p>
          </div>
          
          <div className="flex bg-white p-2 rounded-3xl border border-gray-100 shadow-sm">
             <input 
               type="number" 
               placeholder="Table No." 
               className="bg-transparent border-none outline-none font-bold text-sm px-4 w-32"
               value={newTable}
               onChange={e => setNewTable(e.target.value)}
             />
             <button 
               onClick={addTable}
               className="bg-orange-600 text-white font-black px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-orange-700 transition-all"
             >
               <Plus size={18} /> REGISTER TABLE
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
           {tables.map(num => (
             <div key={num} className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute -right-4 -bottom-4 bg-gray-50 p-10 rounded-full opacity-50 group-hover:scale-110 transition-transform">
                  <QrCode size={40} className="text-gray-200" />
                </div>

                <div className="flex justify-between items-start mb-8 relative z-10">
                   <div className="bg-orange-50 text-orange-600 p-3 rounded-2xl">
                     <TableIcon size={24} />
                   </div>
                   <button onClick={() => removeTable(num)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18} /></button>
                </div>

                <div className="flex flex-col items-center mb-8 relative z-10">
                   <div className="p-4 bg-white rounded-3xl border-2 border-gray-50 shadow-sm mb-4">
                      <QRCodeSVG 
                        id={`qr-table-${num}`}
                        value={`${baseUrl}?table=${num}`} 
                        size={140}
                        level="H"
                        includeMargin={false}
                      />
                   </div>
                   <h3 className="text-2xl font-black text-gray-800">TABLE {num}</h3>
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Scan for Digital Menu</p>
                </div>

                <div className="flex gap-2 relative z-10">
                   <button 
                     onClick={() => downloadQR(num)}
                     className="flex-1 bg-gray-900 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all"
                   >
                     <Download size={14} /> PNG
                   </button>
                   <button 
                     onClick={() => window.print()} 
                     className="flex-1 bg-white border border-gray-100 text-gray-400 font-black py-4 rounded-2xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                   >
                     <Printer size={14} /> PRINT
                   </button>
                </div>
             </div>
           ))}
        </div>

        {/* Print Instruction */}
        <div className="mt-12 p-8 bg-orange-600 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
           <Layers className="absolute -right-10 -bottom-10 text-orange-400 opacity-20" size={200} />
           <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
             <Printer size={32} className="text-white" />
           </div>
           <div className="flex-1">
              <h2 className="text-2xl font-black text-white italic tracking-tighter">Pro Printing Tip</h2>
              <p className="text-orange-100 text-sm font-medium italic mt-1">For the best customer experience, print QRs on premium 300GSM cardstock or acrylic table stands.</p>
           </div>
           <button className="bg-white text-orange-600 font-black px-8 py-4 rounded-2xl text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all relative z-10">PRINT ALL CODES</button>
        </div>
      </div>
    </div>
  );
}

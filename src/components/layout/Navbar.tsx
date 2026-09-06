'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ShoppingBag, 
  FileText, 
  CreditCard, 
  Package, 
  Users, 
  Settings, 
  ShieldCheck, 
  Activity,
  ReceiptText
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Dashboard', icon: Activity },
    { href: '/pos', label: 'Punto de Venta (POS)', icon: ShoppingBag, highlight: true },
    { href: '/dtes', label: 'Facturas DTE (Hacienda)', icon: ReceiptText },
    { href: '/inventario', label: 'Inventario', icon: Package },
    { href: '/clientes', label: 'Clientes Fiscales', icon: Users },
    { href: '/pagos', label: 'Pagos Stripe', icon: CreditCard },
    { href: '/configuracion', label: 'Configuración MH', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Marca */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  HaciendaPOS
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                    DTE SV
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">v1.0</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Navegación Principal */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : item.highlight
                      ? 'text-cyan-300 hover:bg-cyan-950/40 hover:text-cyan-200 border border-cyan-500/20'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Badges de Estado del Sistema */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Estado Ministerio de Hacienda */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="text-emerald-300 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> MH Pruebas (00)
              </span>
            </div>

            {/* Estado Stripe */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs">
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-indigo-300 font-medium">Stripe USD</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

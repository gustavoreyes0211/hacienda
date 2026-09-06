'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  ReceiptText, 
  CreditCard, 
  Package, 
  Users, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Sparkles,
  Layers
} from 'lucide-react';
import { PRODUCTOS_INICIALES } from '@/lib/store-data';

export default function DashboardPage() {
  const [pipelineState] = useState({
    generador: 'Activo (UUID v4)',
    firmador: 'Conectado (JWS SHA-512)',
    hacienda: 'Pruebas (00) - 200 OK',
    stripe: 'Listo (Checkout / Webhooks)'
  });

  const kpis = [
    {
      title: 'Ventas del Día',
      value: '$1,248.50',
      change: '+14.2% vs ayer',
      icon: ShoppingBag,
      color: 'from-blue-600 to-cyan-500',
      textColor: 'text-cyan-400'
    },
    {
      title: 'DTEs Procesados en MH',
      value: '24 Documentos',
      change: '100% de Aprobación',
      icon: ReceiptText,
      color: 'from-emerald-600 to-teal-500',
      textColor: 'text-emerald-400'
    },
    {
      title: 'Cobros con Stripe',
      value: '$890.00',
      change: '12 transacciones exitosas',
      icon: CreditCard,
      color: 'from-purple-600 to-indigo-500',
      textColor: 'text-purple-400'
    },
    {
      title: 'Productos en Inventario',
      value: `${PRODUCTOS_INICIALES.length} Artículos`,
      change: '2 productos con stock bajo',
      icon: Package,
      color: 'from-amber-600 to-orange-500',
      textColor: 'text-amber-400'
    }
  ];

  const ultimosDtes = [
    {
      correlativo: 'DTE-01-M001P001-000000000000024',
      tipo: '01 - Factura Electrónica',
      cliente: 'Carlos Eduardo Menjívar',
      total: '$850.00',
      metodo: 'Stripe',
      estado: 'PROCESADO',
      sello: '20260905D4E1A98F7C3B2...',
      hora: 'Hace 8 min'
    },
    {
      correlativo: 'DTE-03-M001P001-000000000000023',
      tipo: '03 - Crédito Fiscal',
      cliente: 'DISALVA S.A. DE C.V.',
      total: '$361.60',
      metodo: 'Transferencia',
      estado: 'PROCESADO',
      sello: '20260905E5F2B09A8D4C3...',
      hora: 'Hace 32 min'
    },
    {
      correlativo: 'DTE-01-M001P001-000000000000022',
      tipo: '01 - Factura Electrónica',
      cliente: 'Sofía María Rodríguez',
      total: '$89.50',
      metodo: 'Efectivo',
      estado: 'PROCESADO',
      sello: '20260905F6A3C10B9E5D4...',
      hora: 'Hace 1 hora'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner Principal de Bienvenida */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 sm:p-8 border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            Sistema Integral de Facturación DTE & Pagos Electrónicos
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Panel General de la Tienda & Cumplimiento Fiscal
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Punto de venta y gestión comercial integrado directamente con los servicios del{' '}
            <strong className="text-cyan-300">Ministerio de Hacienda de El Salvador</strong> para la emisión de{' '}
            <strong className="text-white">Facturas Electrónicas (01)</strong> y{' '}
            <strong className="text-white">Créditos Fiscales (03)</strong> con cobros automatizados mediante{' '}
            <strong className="text-indigo-300">Stripe</strong>.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/pos"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 hover:from-cyan-400 hover:to-indigo-500 transition-all scale-100 hover:scale-[1.02]"
            >
              <ShoppingBag className="w-4 h-4" />
              Abrir Punto de Venta (POS)
            </Link>
            <Link
              href="/dtes"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 text-sm font-semibold border border-slate-700 transition-all"
            >
              <ReceiptText className="w-4 h-4 text-cyan-400" />
              Ver Facturas DTE Emitidas
            </Link>
          </div>
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div key={index} className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{kpi.title}</span>
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${kpi.color} flex items-center justify-center shadow-md`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">{kpi.value}</span>
                <p className={`text-xs mt-1 font-medium ${kpi.textColor}`}>{kpi.change}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Monitor de Pipeline de Facturación MH & Stripe */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Estado del Pipeline Tecnológico</h2>
          </div>
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Todos los servicios operativos
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>1. Generador de Esquemas</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-semibold text-sm text-slate-200">{pipelineState.generador}</p>
            <p className="text-[11px] text-slate-400">JSON oficial normado v1/v3</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>2. Microservicio Firmador</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-semibold text-sm text-slate-200">{pipelineState.firmador}</p>
            <p className="text-[11px] text-slate-400">Local :8113 y emulador JWS</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>3. API Ministerio Hacienda</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="font-semibold text-sm text-slate-200">{pipelineState.hacienda}</p>
            <p className="text-[11px] text-slate-400">Auth JWT 24h & /recepciondte</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>4. Pasarela Stripe</span>
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
            </div>
            <p className="font-semibold text-sm text-slate-200">{pipelineState.stripe}</p>
            <p className="text-[11px] text-slate-400">Flujo Webhook-to-DTE automático</p>
          </div>
        </div>
      </div>

      {/* Sección en 2 Columnas: Últimos DTEs y Accesos Rápidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tabla de Últimos DTEs emitidos */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Últimos Documentos Tributarios (DTE)</h2>
              <p className="text-xs text-slate-400">Comprobantes procesados y sellados ante Hacienda</p>
            </div>
            <Link
              href="/dtes"
              className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-400 border-b border-slate-800/80 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3 font-semibold">No. Control / Tipo</th>
                  <th className="pb-3 font-semibold">Cliente</th>
                  <th className="pb-3 font-semibold">Total</th>
                  <th className="pb-3 font-semibold">Método</th>
                  <th className="pb-3 font-semibold">Estado MH</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40 text-slate-300">
                {ultimosDtes.map((dte, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3">
                      <p className="font-mono font-medium text-slate-200">{dte.correlativo}</p>
                      <span className="text-[11px] text-slate-400">{dte.tipo}</span>
                    </td>
                    <td className="py-3 font-medium text-slate-200">{dte.cliente}</td>
                    <td className="py-3 font-bold text-white">{dte.total}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                        {dte.metodo}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> {dte.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Accesos a Módulos del Sistema */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white">Módulos del Sistema</h2>
          <p className="text-xs text-slate-400">Navega directamente a las áreas operativas:</p>

          <div className="space-y-2.5">
            <Link
              href="/pos"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">Terminal POS</p>
                  <p className="text-[10px] text-slate-400">Ventas en mostrador y cobro</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </Link>

            <Link
              href="/inventario"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">Inventario & Stock</p>
                  <p className="text-[10px] text-slate-400">Control de productos y precios</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </Link>

            <Link
              href="/clientes"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">Directorio Fiscal</p>
                  <p className="text-[10px] text-slate-400">DUI, NIT, NRC de clientes</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </Link>

            <Link
              href="/pagos"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-200">Pagos Stripe</p>
                  <p className="text-[10px] text-slate-400">Simulador de webhooks & checkout</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

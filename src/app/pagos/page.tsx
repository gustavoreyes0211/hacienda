'use client';

import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Send, 
  Activity, 
  ShieldCheck, 
  Zap, 
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface StripeTransaction {
  id: string;
  cliente: string;
  email: string;
  monto: number;
  moneda: string;
  estado: 'SUCCEEDED' | 'PENDING' | 'FAILED';
  tipoDte: '01' | '03';
  codigoGeneracion?: string;
  selloMH?: string;
  fecha: string;
}

export default function PagosPage() {
  const [transacciones, setTransacciones] = useState<StripeTransaction[]>([
    {
      id: 'cs_live_981273981273',
      cliente: 'Carlos Eduardo Menjívar',
      email: 'carlos.menjivar@gmail.com',
      monto: 850.00,
      moneda: 'USD',
      estado: 'SUCCEEDED',
      tipoDte: '01',
      codigoGeneracion: 'A8B2C3D4-E5F6-4A1B-8C2D-3E4F5A6B7C8D',
      selloMH: '20260905D4E1A98F7C3B2901AF3B4C5D6E7F8A9B',
      fecha: '2026-09-05 17:22'
    },
    {
      id: 'cs_live_123987123987',
      cliente: 'Mariana Isabel Castillo',
      email: 'mariana.castillo@yahoo.com',
      monto: 40.00,
      moneda: 'USD',
      estado: 'SUCCEEDED',
      tipoDte: '01',
      codigoGeneracion: 'D1E2F3A4-B5C6-7D8E-9F0A-1B2C3D4E5F6A',
      selloMH: '20260905C8A7B6C5D4E3F2A1B0C9D8E7F6A5B4C3',
      fecha: '2026-09-05 16:15'
    }
  ]);

  // Simulador de Webhook
  const [simCliente, setSimCliente] = useState('Sofía María Rodríguez');
  const [simEmail, setSimEmail] = useState('sofia.rodriguez@hotmail.com');
  const [simMonto, setSimMonto] = useState('125.00');
  const [simTipoDte, setSimTipoDte] = useState<'01' | '03'>('01');
  const [isSimulating, setIsSimulating] = useState(false);
  const [lastWebhookResult, setLastWebhookResult] = useState<{
    codigoGeneracion: string;
    selloRecibido: string;
  } | null>(null);

  const handleSimulateWebhook = async () => {
    setIsSimulating(true);
    setLastWebhookResult(null);

    const sessionId = `cs_test_${Date.now()}`;
    const montoNum = parseFloat(simMonto) || 10.0;

    const payload = {
      type: 'checkout.session.completed',
      data: {
        object: {
          id: sessionId,
          amount_total: Math.round(montoNum * 100),
          customer_details: {
            name: simCliente,
            email: simEmail
          },
          metadata: {
            clienteNombre: simCliente,
            clienteEmail: simEmail,
            tipoDte: simTipoDte,
            descripcion: 'Compra E-commerce simulada con tarjeta de crédito'
          }
        }
      }
    };

    try {
      const res = await fetch('/api/webhooks/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.received && data.dteEmitido) {
        setLastWebhookResult({
          codigoGeneracion: data.codigoGeneracion,
          selloRecibido: data.selloRecibido
        });

        const nuevaTx: StripeTransaction = {
          id: sessionId,
          cliente: simCliente,
          email: simEmail,
          monto: montoNum,
          moneda: 'USD',
          estado: 'SUCCEEDED',
          tipoDte: simTipoDte,
          codigoGeneracion: data.codigoGeneracion,
          selloMH: data.selloRecibido,
          fecha: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };

        setTransacciones([nuevaTx, ...transacciones]);

        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } else {
        alert('Webhook recibido pero ocurrió un error en la auto-emisión: ' + (data.error || ''));
      }
    } catch (err) {
      console.error(err);
      alert('Error ejecutando simulación de webhook');
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <CreditCard className="w-7 h-7 text-purple-400" />
            Pagos Electrónicos con Stripe & Auto-Facturación
          </h1>
          <p className="text-xs text-slate-400">
            Flujo automatizado: al aprobarse el pago con tarjeta en Stripe, se dispara el pipeline DTE de Hacienda.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs text-purple-300 font-semibold">
          <Activity className="w-3.5 h-3.5 animate-pulse text-purple-400" />
          Stripe Webhook Listener Activo
        </div>
      </div>

      {/* Simulador Interactivo de Webhook de Stripe */}
      <div className="glass-panel p-6 rounded-3xl border border-purple-500/30 space-y-5 bg-gradient-to-r from-slate-950 via-purple-950/20 to-slate-950">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Simulador en Vivo: Flujo Webhook-to-DTE</h2>
            <p className="text-xs text-slate-400">
              Simula un evento de cobro de tarjeta en Stripe para ver cómo el sistema emite el DTE y obtiene el Sello oficial en tiempo real.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Nombre del Cliente</label>
            <input
              type="text"
              value={simCliente}
              onChange={e => setSimCliente(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={simEmail}
              onChange={e => setSimEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Monto de la Venta ($ USD)</label>
            <input
              type="number"
              step="0.01"
              value={simMonto}
              onChange={e => setSimMonto(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Tipo de DTE a Generar</label>
            <select
              value={simTipoDte}
              onChange={e => setSimTipoDte(e.target.value as '01' | '03')}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
            >
              <option value="01">01 - Factura Consumidor Final</option>
              <option value="03">03 - Comprobante de Crédito Fiscal</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            disabled={isSimulating}
            onClick={handleSimulateWebhook}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Ejecutando Pipeline MH en Backend...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Disparar Webhook Stripe (checkout.session.completed)
              </>
            )}
          </button>

          {lastWebhookResult && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="font-bold text-emerald-300 block">
                  ¡DTE Auto-Emitido y Sellado ante Hacienda!
                </span>
                <span className="text-[11px] text-slate-300 font-mono">
                  Sello MH: {lastWebhookResult.selloRecibido.slice(0, 24)}...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Historial de Transacciones de Stripe */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden space-y-4 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">Transacciones Procesadas por Stripe</h2>
          <span className="text-xs text-slate-400">{transacciones.length} pagos registrados</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3 font-semibold">ID Sesión Stripe</th>
                <th className="p-3 font-semibold">Cliente / Email</th>
                <th className="p-3 font-semibold">Monto</th>
                <th className="p-3 font-semibold">Estado Stripe</th>
                <th className="p-3 font-semibold">DTE Asociado</th>
                <th className="p-3 font-semibold">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {transacciones.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-mono text-slate-300">{tx.id}</td>
                  <td className="p-3">
                    <p className="font-semibold text-white">{tx.cliente}</p>
                    <span className="text-[11px] text-slate-400">{tx.email}</span>
                  </td>
                  <td className="p-3 font-extrabold text-white">${tx.monto.toFixed(2)} USD</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> {tx.estado}
                    </span>
                  </td>
                  <td className="p-3">
                    {tx.codigoGeneracion ? (
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-cyan-400">
                          <ShieldCheck className="w-3.5 h-3.5" /> DTE-{tx.tipoDte} Sellado
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block truncate max-w-[180px]">
                          UUID: {tx.codigoGeneracion}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-500">Pendiente</span>
                    )}
                  </td>
                  <td className="p-3 text-slate-400">{tx.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

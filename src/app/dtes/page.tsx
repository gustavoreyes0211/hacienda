'use client';

import React, { useState } from 'react';
import { 
  ReceiptText, 
  Search, 
  CheckCircle2, 
  QrCode, 
  Code, 
  ExternalLink, 
  Copy, 
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { getHaciendaConsultaPublicaUrl } from '@/lib/dte/qr';

interface DteRecord {
  id: string;
  codigoGeneracion: string;
  numeroControl: string;
  tipoDte: '01' | '03';
  tipoNombre: string;
  cliente: string;
  documento: string;
  total: number;
  iva: number;
  fecha: string;
  hora: string;
  sello: string;
  estado: 'PROCESADO' | 'CONTINGENCIA' | 'RECHAZADO';
  metodoPago: string;
}

export default function DtesPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('TODOS');
  const [dteSeleccionado, setDteSeleccionado] = useState<DteRecord | null>(null);
  const [modalType, setModalType] = useState<'JSON' | 'TICKET' | null>(null);

  const [dtes] = useState<DteRecord[]>([
    {
      id: 'dte-1',
      codigoGeneracion: 'A8B2C3D4-E5F6-4A1B-8C2D-3E4F5A6B7C8D',
      numeroControl: 'DTE-01-M001P001-000000000000024',
      tipoDte: '01',
      tipoNombre: 'Factura Electrónica (Consumidor Final)',
      cliente: 'Carlos Eduardo Menjívar',
      documento: 'DUI: 05123456-7',
      total: 850.00,
      iva: 97.79,
      fecha: '2026-09-05',
      hora: '17:22:15',
      sello: '20260905D4E1A98F7C3B2901AF3B4C5D6E7F8A9B',
      estado: 'PROCESADO',
      metodoPago: 'Stripe'
    },
    {
      id: 'dte-2',
      codigoGeneracion: 'F1E2D3C4-B5A6-4F7E-8D9C-0B1A2C3D4E5F',
      numeroControl: 'DTE-03-M001P001-000000000000023',
      tipoDte: '03',
      tipoNombre: 'Comprobante de Crédito Fiscal',
      cliente: 'DISTRIBUIDORA INDUSTRIAL SALVADOREÑA S.A.',
      documento: 'NIT: 0614-250392-102-1 (NRC: 254890-3)',
      total: 361.60,
      iva: 41.60,
      fecha: '2026-09-05',
      hora: '16:48:30',
      sello: '20260905E5F2B09A8D4C3812BC4C5D6E7F8A9B0C',
      estado: 'PROCESADO',
      metodoPago: 'Transferencia'
    },
    {
      id: 'dte-3',
      codigoGeneracion: 'C7D8E9F0-1A2B-4C3D-8E9F-0A1B2C3D4E5F',
      numeroControl: 'DTE-01-M001P001-000000000000022',
      tipoDte: '01',
      tipoNombre: 'Factura Electrónica (Consumidor Final)',
      cliente: 'Sofía María Rodríguez Peña',
      documento: 'DUI: 04891230-1',
      total: 89.50,
      iva: 10.30,
      fecha: '2026-09-05',
      hora: '15:10:02',
      sello: '20260905F6A3C10B9E5D4723CD5D6E7F8A9B0C1D',
      estado: 'PROCESADO',
      metodoPago: 'Efectivo'
    }
  ]);

  const dtesFiltrados = dtes.filter(d => {
    const matchTipo = filtroTipo === 'TODOS' || d.tipoDte === filtroTipo;
    const matchBusqueda = d.numeroControl.toLowerCase().includes(busqueda.toLowerCase()) ||
                          d.codigoGeneracion.toLowerCase().includes(busqueda.toLowerCase()) ||
                          d.cliente.toLowerCase().includes(busqueda.toLowerCase());
    return matchTipo && matchBusqueda;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ReceiptText className="w-7 h-7 text-cyan-400" />
            Documentos Tributarios Electrónicos (DTE)
          </h1>
          <p className="text-xs text-slate-400">
            Registro oficial de Facturas (01) y Créditos Fiscales (03) sellados y transmitidos al Ministerio de Hacienda.
          </p>
        </div>

        {/* Filtros por tipo de DTE */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
          {['TODOS', '01', '03'].map(tipo => (
            <button
              key={tipo}
              onClick={() => setFiltroTipo(tipo)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filtroTipo === tipo
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tipo === 'TODOS' ? 'Todos los DTEs' : tipo === '01' ? 'Facturas (01)' : 'Créditos Fiscales (03)'}
            </button>
          ))}
        </div>
      </div>

      {/* Buscador */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por número de control, UUID o nombre del cliente..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Tabla de DTEs */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">Identificación Fiscal</th>
                <th className="p-4 font-semibold">Receptor (Cliente)</th>
                <th className="p-4 font-semibold">Monto Total</th>
                <th className="p-4 font-semibold">IVA</th>
                <th className="p-4 font-semibold">Estado Hacienda</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {dtesFiltrados.map(d => (
                <tr key={d.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <span className="font-mono font-bold text-cyan-300 block">{d.numeroControl}</span>
                    <span className="text-[11px] text-slate-400">{d.tipoNombre}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">UUID: {d.codigoGeneracion}</span>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-200">{d.cliente}</p>
                    <span className="text-[11px] text-slate-400">{d.documento}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-white text-sm">${d.total.toFixed(2)}</span>
                    <span className="text-[10px] text-slate-400 block">{d.metodoPago}</span>
                  </td>
                  <td className="p-4 text-cyan-400 font-semibold">${d.iva.toFixed(2)}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> {d.estado}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Sello: {d.sello.slice(0, 16)}...
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setDteSeleccionado(d);
                          setModalType('TICKET');
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700"
                        title="Ver Representación Gráfica"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setDteSeleccionado(d);
                          setModalType('JSON');
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                        title="Ver JSON Oficial"
                      >
                        <Code className="w-4 h-4" />
                      </button>
                      <a
                        href={getHaciendaConsultaPublicaUrl({
                          ambiente: '00',
                          codigoGeneracion: d.codigoGeneracion,
                          fechaEmision: d.fecha
                        })}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/30"
                        title="Consulta Pública en Hacienda"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Representación Gráfica (Ticket Oficial con QR) */}
      {dteSeleccionado && modalType === 'TICKET' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-cyan-500/30 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Representación Gráfica DTE</h3>
              </div>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <div className="text-center pb-2 border-b border-slate-800">
                <h4 className="font-extrabold text-sm text-white">COMERCIAL TIENDA SALVADOREÑA S.A.</h4>
                <p className="text-[11px] text-slate-400">NIT: 0614-010190-101-2 • NRC: 298765-4</p>
                <p className="text-[10px] text-cyan-300 font-semibold mt-1">{dteSeleccionado.tipoNombre}</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <p><span className="text-slate-400">No. Control:</span> <strong className="font-mono text-slate-200">{dteSeleccionado.numeroControl}</strong></p>
                <p><span className="text-slate-400">Código Generación:</span> <strong className="font-mono text-slate-200">{dteSeleccionado.codigoGeneracion}</strong></p>
                <p><span className="text-slate-400">Cliente:</span> <span className="text-slate-200">{dteSeleccionado.cliente}</span></p>
                <p><span className="text-slate-400">Documento:</span> <span className="text-slate-200">{dteSeleccionado.documento}</span></p>
                <p><span className="text-slate-400">Fecha y Hora:</span> <span className="text-slate-200">{dteSeleccionado.fecha} {dteSeleccionado.hora}</span></p>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm">
                <span className="text-white">TOTAL PAGADO:</span>
                <span className="text-emerald-400">${dteSeleccionado.total.toFixed(2)} USD</span>
              </div>

              <div className="pt-3 border-t border-slate-800 text-center space-y-2">
                <div className="inline-block p-2 bg-white rounded-xl shadow-md">
                  <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-slate-900">
                    <QrCode className="w-24 h-24" />
                  </div>
                </div>
                <p className="text-[10px] text-slate-400">
                  Sello MH: {dteSeleccionado.sello.slice(0, 24)}...
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={getHaciendaConsultaPublicaUrl({
                  ambiente: '00',
                  codigoGeneracion: dteSeleccionado.codigoGeneracion,
                  fechaEmision: dteSeleccionado.fecha
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold text-center flex items-center justify-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4" /> Consultar en Hacienda
              </a>
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Visor de JSON Oficial */}
      {dteSeleccionado && modalType === 'JSON' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-6 rounded-3xl border border-slate-700 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                JSON Oficial del DTE (Normativa Ministerio de Hacienda)
              </h3>
              <button onClick={() => setModalType(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 max-h-96 overflow-y-auto">
{JSON.stringify({
  identificacion: {
    version: dteSeleccionado.tipoDte === '01' ? 1 : 3,
    ambiente: '00',
    tipoDte: dteSeleccionado.tipoDte,
    numeroControl: dteSeleccionado.numeroControl,
    codigoGeneracion: dteSeleccionado.codigoGeneracion,
    tipoModelo: 1,
    tipoOperacion: 1,
    fecEmi: dteSeleccionado.fecha,
    horEmi: dteSeleccionado.hora,
    tipoMoneda: 'USD'
  },
  emisor: {
    nit: '06140101901012',
    nrc: '298765-4',
    nombre: 'COMERCIAL TIENDA SALVADOREÑA S.A. DE C.V.',
    codActividad: '47190',
    descActividad: 'Venta al por menor en comercios no especializados',
    codEstablecimientoMH: 'M001',
    codPuntoVentaMH: 'P001'
  },
  receptor: {
    nombre: dteSeleccionado.cliente,
    numDocumento: dteSeleccionado.documento
  },
  resumen: {
    totalPagar: dteSeleccionado.total,
    iva: dteSeleccionado.iva,
    condicionOperacion: 1
  },
  selloRecibidoMH: dteSeleccionado.sello
}, null, 2)}
            </pre>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(dteSeleccionado, null, 2));
                  alert('JSON copiado');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" /> Copiar
              </button>
              <button
                onClick={() => setModalType(null)}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Check
} from 'lucide-react';
import { CLIENTES_INICIALES, ClienteTienda } from '@/lib/store-data';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<ClienteTienda[]>(CLIENTES_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [nuevo, setNuevo] = useState({
    nombre: '',
    tipoDocumento: '13', // DUI
    numDocumento: '',
    nrc: '',
    nombreComercial: '',
    codActividad: '47190',
    departamento: '06',
    municipio: '14',
    direccion: '',
    telefono: '',
    correo: '',
    tipoCliente: 'CONSUMIDOR_FINAL' as 'CONSUMIDOR_FINAL' | 'CONTRIBUYENTE'
  });

  const clientesFiltrados = clientes.filter(c =>
    c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.numDocumento.toLowerCase().includes(busqueda.toLowerCase()) ||
    (c.nrc && c.nrc.toLowerCase().includes(busqueda.toLowerCase()))
  );

  const handleCrearCliente = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo.nombre || !nuevo.numDocumento || !nuevo.correo) return;

    const cliente: ClienteTienda = {
      id: `cli-${Date.now()}`,
      nombre: nuevo.nombre,
      tipoDocumento: nuevo.tipoDocumento,
      numDocumento: nuevo.numDocumento,
      nrc: nuevo.tipoCliente === 'CONTRIBUYENTE' ? nuevo.nrc : undefined,
      nombreComercial: nuevo.nombreComercial || undefined,
      codActividad: nuevo.codActividad,
      departamento: nuevo.departamento,
      municipio: nuevo.municipio,
      direccion: nuevo.direccion || 'San Salvador',
      telefono: nuevo.telefono || '2200-0000',
      correo: nuevo.correo,
      tipoCliente: nuevo.tipoCliente
    };

    setClientes([cliente, ...clientes]);
    setShowModal(false);
    setNuevo({
      nombre: '',
      tipoDocumento: '13',
      numDocumento: '',
      nrc: '',
      nombreComercial: '',
      codActividad: '47190',
      departamento: '06',
      municipio: '14',
      direccion: '',
      telefono: '',
      correo: '',
      tipoCliente: 'CONSUMIDOR_FINAL'
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-emerald-400" />
            Directorio Fiscal de Clientes
          </h1>
          <p className="text-xs text-slate-400">
            Registro de Consumidores Finales (DUI) y Contribuyentes (NIT/NRC) para emisión de DTE.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Registrar Cliente
        </button>
      </div>

      {/* Buscador */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar cliente por nombre, DUI, NIT o NRC..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Grid de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {clientesFiltrados.map(c => {
          const esContribuyente = c.tipoCliente === 'CONTRIBUYENTE';
          return (
            <div key={c.id} className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    esContribuyente 
                      ? 'bg-indigo-950 text-indigo-300 border border-indigo-500/30' 
                      : 'bg-cyan-950 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {esContribuyente ? <Building2 className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {esContribuyente ? 'Contribuyente (CCF-03)' : 'Consumidor Final (DTE-01)'}
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-white">{c.nombre}</h3>
                  {c.nombreComercial && (
                    <p className="text-xs text-slate-400 font-medium">{c.nombreComercial}</p>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Documento:</span>
                    <span className="font-mono font-bold text-slate-200">{c.numDocumento}</span>
                  </div>
                  {c.nrc && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">NRC Hacienda:</span>
                      <span className="font-mono font-bold text-cyan-400">{c.nrc}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{c.correo}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{c.telefono}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 mt-0.5" />
                    <span className="text-[11px] line-clamp-2">{c.direccion}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Registrar Cliente */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-emerald-500/30 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                Registrar Cliente Fiscal
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCrearCliente} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Tipo de Cliente Tributario *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNuevo({ ...nuevo, tipoCliente: 'CONSUMIDOR_FINAL', tipoDocumento: '13' })}
                    className={`p-2.5 rounded-xl border text-xs font-bold ${
                      nuevo.tipoCliente === 'CONSUMIDOR_FINAL'
                        ? 'bg-cyan-950 border-cyan-500 text-cyan-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Consumidor Final (DUI)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNuevo({ ...nuevo, tipoCliente: 'CONTRIBUYENTE', tipoDocumento: '36' })}
                    className={`p-2.5 rounded-xl border text-xs font-bold ${
                      nuevo.tipoCliente === 'CONTRIBUYENTE'
                        ? 'bg-indigo-950 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    Empresa / Contribuyente (NRC)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Nombre / Razón Social *</label>
                <input
                  required
                  type="text"
                  value={nuevo.nombre}
                  onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })}
                  placeholder="Ej. Distribuidora Salvadoreña S.A. o Nombre Personal"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Número de Documento (DUI/NIT) *</label>
                  <input
                    required
                    type="text"
                    value={nuevo.numDocumento}
                    onChange={e => setNuevo({ ...nuevo, numDocumento: e.target.value })}
                    placeholder={nuevo.tipoCliente === 'CONSUMIDOR_FINAL' ? '05123456-7' : '0614-010190-101-2'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                {nuevo.tipoCliente === 'CONTRIBUYENTE' && (
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">Número de NRC *</label>
                    <input
                      required
                      type="text"
                      value={nuevo.nrc}
                      onChange={e => setNuevo({ ...nuevo, nrc: e.target.value })}
                      placeholder="298765-4"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Correo Electrónico (Envío DTE) *</label>
                  <input
                    required
                    type="email"
                    value={nuevo.correo}
                    onChange={e => setNuevo({ ...nuevo, correo: e.target.value })}
                    placeholder="facturacion@cliente.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Teléfono</label>
                  <input
                    type="text"
                    value={nuevo.telefono}
                    onChange={e => setNuevo({ ...nuevo, telefono: e.target.value })}
                    placeholder="2200-0000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Dirección Fiscal</label>
                <input
                  type="text"
                  value={nuevo.direccion}
                  onChange={e => setNuevo({ ...nuevo, direccion: e.target.value })}
                  placeholder="Calle principal #123, San Salvador"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30"
                >
                  <Check className="w-4 h-4" /> Guardar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

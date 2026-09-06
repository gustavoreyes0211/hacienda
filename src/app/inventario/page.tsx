'use client';

import React, { useState } from 'react';
import { 
  Package, 
  Search, 
  Plus, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp, 
  Boxes,
  Check
} from 'lucide-react';
import { PRODUCTOS_INICIALES, ProductoTienda } from '@/lib/store-data';

export default function InventarioPage() {
  const [productos, setProductos] = useState<ProductoTienda[]>(PRODUCTOS_INICIALES);
  const [busqueda, setBusqueda] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Formulario nuevo producto
  const [nuevo, setNuevo] = useState({
    sku: '',
    nombre: '',
    descripcion: '',
    precio: '',
    costo: '',
    stock: '',
    stockMinimo: '5',
    categoria: 'General',
    esGravado: true
  });

  const productosFiltrados = productos.filter(p =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.sku.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busqueda.toLowerCase())
  );

  const valorInventarioVenta = productos.reduce((acc, p) => acc + (p.precio * p.stock), 0);
  const valorInventarioCosto = productos.reduce((acc, p) => acc + (p.costo * p.stock), 0);
  const margenPromedio = valorInventarioVenta > 0 
    ? ((valorInventarioVenta - valorInventarioCosto) / valorInventarioVenta) * 100 
    : 0;

  const handleCrearProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevo.sku || !nuevo.nombre || !nuevo.precio) return;

    const prod: ProductoTienda = {
      id: `prod-${Date.now()}`,
      sku: nuevo.sku.toUpperCase(),
      nombre: nuevo.nombre,
      descripcion: nuevo.descripcion,
      precio: parseFloat(nuevo.precio) || 0,
      costo: parseFloat(nuevo.costo) || 0,
      stock: parseInt(nuevo.stock) || 0,
      stockMinimo: parseInt(nuevo.stockMinimo) || 5,
      categoria: nuevo.categoria,
      esGravado: nuevo.esGravado
    };

    setProductos([prod, ...productos]);
    setShowModal(false);
    setNuevo({
      sku: '',
      nombre: '',
      descripcion: '',
      precio: '',
      costo: '',
      stock: '',
      stockMinimo: '5',
      categoria: 'General',
      esGravado: true
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Package className="w-7 h-7 text-indigo-400" />
            Control de Inventario & Catálogo
          </h1>
          <p className="text-xs text-slate-400">
            Existencias en tiempo real, alertas de stock mínimo y clasificación tributaria (IVA 13%).
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" /> Nuevo Producto
        </button>
      </div>

      {/* Métricas de Inventario */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Valoración Total (Venta)</span>
            <DollarSign className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">${valorInventarioVenta.toFixed(2)}</p>
          <p className="text-[11px] text-slate-400 mt-1">{productos.length} SKUs activos</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Costo Total de Adquisición</span>
            <Boxes className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-extrabold text-white mt-2">${valorInventarioCosto.toFixed(2)}</p>
          <p className="text-[11px] text-slate-400 mt-1">Capital invertido en almacén</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Margen Promedio de Ganancia</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-2">{margenPromedio.toFixed(1)}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Rentabilidad bruta de catálogo</p>
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
            placeholder="Buscar por SKU, nombre del producto o categoría..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tabla de Productos */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-4 font-semibold">SKU / Producto</th>
                <th className="p-4 font-semibold">Categoría</th>
                <th className="p-4 font-semibold">Precio Venta</th>
                <th className="p-4 font-semibold">Costo</th>
                <th className="p-4 font-semibold">Stock Actual</th>
                <th className="p-4 font-semibold">Régimen IVA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {productosFiltrados.map(p => {
                const stockBajo = p.stock <= p.stockMinimo;
                return (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <span className="font-mono font-bold text-cyan-300 block">{p.sku}</span>
                      <p className="font-semibold text-slate-200">{p.nombre}</p>
                      <span className="text-[11px] text-slate-400">{p.descripcion}</span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px] font-medium border border-slate-700">
                        {p.categoria}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-white text-sm">${p.precio.toFixed(2)}</td>
                    <td className="p-4 text-slate-400">${p.costo.toFixed(2)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${stockBajo ? 'text-amber-400' : 'text-slate-200'}`}>
                          {p.stock} uds
                        </span>
                        {stockBajo && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-400 border border-amber-500/30">
                            <AlertTriangle className="w-3 h-3" /> Reabastecer
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        p.esGravado
                          ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/30'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/30'
                      }`}>
                        {p.esGravado ? 'Gravado 13% IVA' : 'Exento de IVA'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nuevo Producto */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-indigo-500/30 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                Registrar Nuevo Producto en Catálogo
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCrearProducto} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Código SKU *</label>
                  <input
                    required
                    type="text"
                    value={nuevo.sku}
                    onChange={e => setNuevo({ ...nuevo, sku: e.target.value })}
                    placeholder="Ej. LAP-002"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Categoría</label>
                  <input
                    type="text"
                    value={nuevo.categoria}
                    onChange={e => setNuevo({ ...nuevo, categoria: e.target.value })}
                    placeholder="Ej. Tecnología"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Nombre del Producto *</label>
                <input
                  required
                  type="text"
                  value={nuevo.nombre}
                  onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })}
                  placeholder="Ej. Auriculares Bluetooth Noise Cancelling"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Descripción</label>
                <input
                  type="text"
                  value={nuevo.descripcion}
                  onChange={e => setNuevo({ ...nuevo, descripcion: e.target.value })}
                  placeholder="Detalles del producto"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Precio de Venta (USD) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={nuevo.precio}
                    onChange={e => setNuevo({ ...nuevo, precio: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Costo de Adquisición (USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevo.costo}
                    onChange={e => setNuevo({ ...nuevo, costo: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    value={nuevo.stock}
                    onChange={e => setNuevo({ ...nuevo, stock: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Stock Mínimo (Alerta)</label>
                  <input
                    type="number"
                    value={nuevo.stockMinimo}
                    onChange={e => setNuevo({ ...nuevo, stockMinimo: e.target.value })}
                    placeholder="5"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nuevo.esGravado}
                    onChange={e => setNuevo({ ...nuevo, esGravado: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-800"
                  />
                  <span className="text-slate-300 font-medium">Producto Gravado con IVA (13%) para DTE</span>
                </label>
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
                  className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-indigo-600/30"
                >
                  <Check className="w-4 h-4" /> Guardar Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

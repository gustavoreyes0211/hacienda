'use client';

import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  QrCode, 
  ExternalLink, 
  Copy, 
  Search, 
  Sparkles,
  Building2,
  User,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRODUCTOS_INICIALES, CLIENTES_INICIALES, ProductoTienda, ClienteTienda } from '@/lib/store-data';

interface CartItem {
  producto: ProductoTienda;
  cantidad: number;
}

export default function PosPage() {
  const [productos] = useState<ProductoTienda[]>(PRODUCTOS_INICIALES);
  const [clientes] = useState<ClienteTienda[]>(CLIENTES_INICIALES);
  
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('Todos');
  const [busqueda, setBusqueda] = useState<string>('');
  
  const [cart, setCart] = useState<CartItem[]>([
    { producto: PRODUCTOS_INICIALES[0], cantidad: 1 },
    { producto: PRODUCTOS_INICIALES[2], cantidad: 1 }
  ]);

  const [tipoDte, setTipoDte] = useState<'01' | '03'>('01');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<ClienteTienda>(CLIENTES_INICIALES[0]);
  const [metodoPago, setMetodoPago] = useState<'01' | '02' | '03'>('02'); // 01: Efectivo, 02: Stripe, 03: Transferencia
  const [efectivoRecibido, setEfectivoRecibido] = useState<string>('1000');

  // Estados de emisión
  const [isEmitting, setIsEmitting] = useState<boolean>(false);
  const [resultadoDte, setResultadoDte] = useState<{
    codigoGeneracion: string;
    numeroControl: string;
    selloRecibido: string;
    qrDataUrl: string;
    qrUrl: string;
    totalPagar: number;
    jsonOficial: unknown;
  } | null>(null);

  const categorias = ['Todos', ...Array.from(new Set(productos.map(p => p.categoria)))];

  const productosFiltrados = productos.filter(p => {
    const matchCat = categoriaSeleccionada === 'Todos' || p.categoria === categoriaSeleccionada;
    const matchSearch = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || 
                        p.sku.toLowerCase().includes(busqueda.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (producto: ProductoTienda) => {
    setCart(prev => {
      const existing = prev.find(item => item.producto.id === producto.id);
      if (existing) {
        return prev.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.producto.id === id) {
            const newQty = item.cantidad + delta;
            return newQty > 0 ? { ...item, cantidad: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.producto.id !== id));
  };

  // Cálculos de IVA y Totales según normativa fiscal de El Salvador
  let totalGravada = 0;
  let totalExenta = 0;

  cart.forEach(item => {
    const sub = item.cantidad * item.producto.precio;
    if (item.producto.esGravado) {
      totalGravada += sub;
    } else {
      totalExenta += sub;
    }
  });

  let iva = 0;
  let totalPagar = 0;

  if (tipoDte === '01') {
    // Factura Consumidor Final (IVA incluido en precio)
    totalPagar = totalGravada + totalExenta;
    iva = totalGravada - (totalGravada / 1.13);
  } else {
    // Crédito Fiscal (IVA 13% calculado sobre el neto gravado)
    iva = totalGravada * 0.13;
    totalPagar = totalGravada + totalExenta + iva;
  }

  const cambioEfectivo = Math.max(0, (parseFloat(efectivoRecibido) || 0) - totalPagar);

  // Emisión y transmisión oficial ante Hacienda
  const handleEmitirDTE = async () => {
    if (cart.length === 0) return;
    setIsEmitting(true);

    try {
      const itemsPayload = cart.map(item => ({
        codigo: item.producto.sku,
        descripcion: item.producto.nombre,
        cantidad: item.cantidad,
        precioUni: item.producto.precio,
        esGravado: item.producto.esGravado
      }));

      const res = await fetch('/api/dte/emitir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipoDte,
          cliente: clienteSeleccionado,
          items: itemsPayload,
          metodoPago,
          referenciaPago: metodoPago === '02' ? 'STRIPE-TERMINAL-POS' : 'PAGO-MOSTRADOR'
        })
      });

      const data = await res.json();

      if (data.success) {
        setResultadoDte({
          codigoGeneracion: data.dte.codigoGeneracion,
          numeroControl: data.dte.numeroControl,
          selloRecibido: data.hacienda.selloRecibido,
          qrDataUrl: data.qr.dataUrl,
          qrUrl: data.qr.url,
          totalPagar: data.dte.totalPagar,
          jsonOficial: data.jsonOficial
        });

        // Lanzar confeti de celebración
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } else {
        alert(`Error al emitir DTE: ${data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al emitir DTE');
    } finally {
      setIsEmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header del POS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <ShoppingBag className="w-7 h-7 text-cyan-400" />
            Terminal Punto de Venta (POS)
          </h1>
          <p className="text-xs text-slate-400">
            Venta rápida con cobro en mostrador o Stripe y emisión instantánea de DTE ante Hacienda.
          </p>
        </div>

        {/* Selector de Tipo de DTE */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => {
              setTipoDte('01');
              setClienteSeleccionado(clientes[0]);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tipoDte === '01'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            01 Factura Electrónica
          </button>
          <button
            onClick={() => {
              setTipoDte('03');
              // Asignar el primer cliente contribuyente
              const contrib = clientes.find(c => c.nrc) || clientes[1];
              setClienteSeleccionado(contrib);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              tipoDte === '03'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            03 Crédito Fiscal (CCF)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Catálogo y Búsqueda (7 columnas) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Barra de Búsqueda y Categorías */}
          <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar producto por nombre o código SKU..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {categorias.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoriaSeleccionada(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    categoriaSeleccionada === cat
                      ? 'bg-slate-700 text-cyan-300 border border-cyan-500/40'
                      : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Productos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[620px] overflow-y-auto pr-1">
            {productosFiltrados.map(prod => (
              <div
                key={prod.id}
                onClick={() => addToCart(prod)}
                className="glass-card p-4 rounded-2xl border border-slate-800/80 cursor-pointer flex flex-col justify-between group hover:border-cyan-500/40"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span className="font-mono bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">{prod.sku}</span>
                    <span className={`px-2 py-0.5 rounded-full font-semibold ${prod.esGravado ? 'bg-indigo-950 text-indigo-300' : 'bg-emerald-950 text-emerald-300'}`}>
                      {prod.esGravado ? 'IVA 13%' : 'Exento'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors line-clamp-2">
                    {prod.nombre}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{prod.descripcion}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-white">${prod.precio.toFixed(2)}</span>
                    <p className="text-[10px] text-slate-400">Stock: {prod.stock} uds</p>
                  </div>
                  <button className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-600 group-hover:text-white transition-all shadow-sm">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna Derecha: Carrito, Cliente, Pago y Emisión (5 columnas) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            {/* Selección del Cliente Fiscal */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Cliente / Receptor de Hacienda</span>
                <span className="text-[11px] text-cyan-400">{tipoDte === '01' ? 'Consumidor Final' : 'Empresa / NRC'}</span>
              </label>
              <select
                value={clienteSeleccionado.id}
                onChange={e => {
                  const c = clientes.find(item => item.id === e.target.value);
                  if (c) setClienteSeleccionado(c);
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                {clientes
                  .filter(c => tipoDte === '01' ? true : !!c.nrc)
                  .map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nombre} ({c.numDocumento}) {c.nrc ? `- NRC: ${c.nrc}` : ''}
                    </option>
                  ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Email de envío DTE: <strong className="text-slate-300">{clienteSeleccionado.correo}</strong>
              </p>
            </div>

            {/* Lista del Carrito */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold border-b border-slate-800 pb-2">
                <span>Artículos en Venta ({cart.reduce((a, b) => a + b.cantidad, 0)})</span>
                {cart.length > 0 && (
                  <button onClick={() => setCart([])} className="text-[11px] text-rose-400 hover:underline">
                    Vaciar carrito
                  </button>
                )}
              </div>

              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs">
                    El carrito está vacío. Selecciona productos del catálogo.
                  </div>
                ) : (
                  cart.map(item => (
                    <div
                      key={item.producto.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs"
                    >
                      <div className="max-w-[170px]">
                        <p className="font-semibold text-slate-200 truncate">{item.producto.nombre}</p>
                        <span className="text-[11px] text-slate-400">${item.producto.precio.toFixed(2)} c/u</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center rounded-lg bg-slate-800 border border-slate-700">
                          <button
                            onClick={() => updateQuantity(item.producto.id, -1)}
                            className="p-1 text-slate-300 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 font-bold text-slate-100">{item.cantidad}</span>
                          <button
                            onClick={() => updateQuantity(item.producto.id, 1)}
                            className="p-1 text-slate-300 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="font-bold text-slate-100 w-16 text-right">
                          ${(item.cantidad * item.producto.precio).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.producto.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Método de Pago */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300">Método de Pago:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMetodoPago('02')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                    metodoPago === '02'
                      ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-md shadow-purple-950'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4 text-purple-400" />
                  Stripe Tarjeta
                </button>
                <button
                  type="button"
                  onClick={() => setMetodoPago('01')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                    metodoPago === '01'
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Banknote className="w-4 h-4 text-emerald-400" />
                  Efectivo
                </button>
                <button
                  type="button"
                  onClick={() => setMetodoPago('03')}
                  className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-xs font-semibold transition-all ${
                    metodoPago === '03'
                      ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-950'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <RefreshCw className="w-4 h-4 text-indigo-400" />
                  Transferencia
                </button>
              </div>

              {metodoPago === '01' && (
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Efectivo Recibido:</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-slate-300 font-bold">$</span>
                      <input
                        type="number"
                        value={efectivoRecibido}
                        onChange={e => setEfectivoRecibido(e.target.value)}
                        className="w-24 px-2 py-1 rounded bg-slate-800 text-white font-bold text-xs"
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Cambio:</span>
                    <p className="text-emerald-400 font-bold text-sm">${cambioEfectivo.toFixed(2)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Desglose de Totales Fiscales */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal Ventas Gravadas:</span>
                <span>${totalGravada.toFixed(2)}</span>
              </div>
              {totalExenta > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>Ventas Exentas:</span>
                  <span>${totalExenta.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-cyan-400">
                <span>IVA (13%) {tipoDte === '01' ? '(Incluido)' : '(Debito Fiscal)'}:</span>
                <span>${iva.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                <span className="font-extrabold text-sm text-white">TOTAL A PAGAR:</span>
                <span className="font-black text-xl text-white tracking-tight">${totalPagar.toFixed(2)}</span>
              </div>
            </div>

            {/* Botón de Emisión Oficial de DTE */}
            <button
              disabled={cart.length === 0 || isEmitting}
              onClick={handleEmitirDTE}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all"
            >
              {isEmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Firmando y Transmitiendo a Hacienda...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-cyan-200" />
                  Emitir {tipoDte === '01' ? 'Factura Electrónica' : 'Crédito Fiscal'} & Cobrar
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Éxito de Emisión de DTE con Sello y QR Oficial de Hacienda */}
      {resultadoDte && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-cyan-500/40 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">¡DTE Procesado y Sellado!</h3>
                  <p className="text-xs text-emerald-400 font-semibold">
                    Aceptado con éxito por el Ministerio de Hacienda
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResultadoDte(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Datos Tributarios Clave */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Número de Control:</span>
                <span className="font-mono font-bold text-cyan-300">{resultadoDte.numeroControl}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Código de Generación (UUID):</span>
                <span className="font-mono font-semibold text-slate-200 text-[11px] truncate max-w-[260px]">
                  {resultadoDte.codigoGeneracion}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800/80">
                <span className="text-slate-400">Sello Oficial de Recepción:</span>
                <span className="font-mono font-bold text-emerald-400 text-[11px] truncate max-w-[260px]">
                  {resultadoDte.selloRecibido}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Monto Total Pagado:</span>
                <span className="font-extrabold text-base text-white">${resultadoDte.totalPagar.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Código QR Oficial de Hacienda */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              {resultadoDte.qrDataUrl ? (
                <img
                  src={resultadoDte.qrDataUrl}
                  alt="Código QR DTE Ministerio de Hacienda"
                  className="w-32 h-32 rounded-xl bg-white p-1.5 shadow-md"
                />
              ) : (
                <div className="w-32 h-32 rounded-xl bg-slate-800 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-slate-500" />
                </div>
              )}

              <div className="space-y-2 text-center sm:text-left text-xs flex-1">
                <h4 className="font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" /> Código QR de Verificación
                </h4>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Escanea el código o consulta la validez oficial del DTE en el portal ciudadano del Ministerio de Hacienda.
                </p>
                <a
                  href={resultadoDte.qrUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[11px] font-semibold hover:bg-cyan-900 transition-colors"
                >
                  Abrir Consulta Pública MH <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(resultadoDte.jsonOficial, null, 2));
                  alert('JSON oficial del DTE copiado al portapapeles');
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors"
              >
                <Copy className="w-3.5 h-3.5 text-cyan-400" /> Copiar JSON DTE
              </button>
              <button
                onClick={() => {
                  setResultadoDte(null);
                  setCart([]);
                }}
                className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all"
              >
                Nueva Venta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

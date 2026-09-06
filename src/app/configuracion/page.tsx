'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Key,
  Server,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Building,
  Save,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  FileKey,
  Wifi,
  WifiOff,
  Terminal,
  Download,
  FileSignature,
  Info,
  Cpu
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ConfiguracionPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Estados de visibilidad de contraseñas
  const [showApiKey, setShowApiKey] = useState(false);
  const [showCertPass, setShowCertPass] = useState(false);

  // Estados de prueba de conexión con Hacienda
  const [testingConnection, setTestingConnection] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    ambiente?: string;
    tiempoRespuestaMs?: number;
    servidorHacienda?: string;
    tokenStatus?: string;
    tokenMuestra?: string;
    firmadorStatus?: string;
    error?: string;
    nota?: string;
  } | null>(null);

  // Estados del Firmador MH
  const [testingFirmador, setTestingFirmador] = useState(false);
  const [firmadorResult, setFirmadorResult] = useState<{
    online: boolean;
    statusEndpoint?: string;
    mensaje?: string;
    error?: string;
    tiempoRespuestaMs?: number;
    modoFallback?: string;
  } | null>(null);

  // Formulario de credenciales
  const [formData, setFormData] = useState({
    ambiente: '00',
    nit: '06140101901012',
    nrc: '298765-4',
    razonSocial: 'COMERCIAL TIENDA SALVADOREÑA S.A. DE C.V.',
    nombreComercial: 'Tienda Express DTE',
    codActividad: '47190',
    descActividad: 'Venta al por menor en comercios no especializados',
    direccion: 'Alameda Roosevelt #1234, San Salvador',
    telefono: '2255-0000',
    correo: 'facturacion@tiendaexpress.sv',
    codEstablecimiento: 'M001',
    codPuntoVenta: 'P001',
    claveApi: 'ClavePruebaApiMH2026*',
    firmadorUrl: 'http://localhost:8113/firmardocumento',
    certPassword: 'password_del_certificado_pfx'
  });

  // Cargar credenciales guardadas al montar
  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/configuracion');
        if (res.ok) {
          const data = await res.json();
          setFormData(prev => ({ ...prev, ...data }));
        }
      } catch (err) {
        console.error('Error cargando configuración:', err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch('/api/configuracion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSaveSuccess(true);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 }
        });
        setTimeout(() => setSaveSuccess(false), 5000);
      } else {
        alert('Ocurrió un error al guardar las credenciales');
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al guardar configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/configuracion/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nit: formData.nit,
          claveApi: formData.claveApi,
          ambiente: formData.ambiente,
          firmadorUrl: formData.firmadorUrl
        })
      });

      const data = await res.json();
      setTestResult(data);
    } catch (err) {
      console.error(err);
      setTestResult({
        success: false,
        error: 'No se pudo contactar con el endpoint de prueba'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleTestFirmador = async () => {
    setTestingFirmador(true);
    setFirmadorResult(null);
    try {
      const res = await fetch('/api/configuracion/firmador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firmadorUrl: formData.firmadorUrl })
      });
      const data = await res.json();
      setFirmadorResult(data);
    } catch (err) {
      console.error(err);
      setFirmadorResult({
        online: false,
        error: 'Error interno al diagnosticar el Firmador'
      });
    } finally {
      setTestingFirmador(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center gap-3 text-slate-400">
        <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
        <span>Cargando configuración de Hacienda...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Settings className="w-7 h-7 text-cyan-400" />
            Configuración de Credenciales DTE
          </h1>
          <p className="text-xs text-slate-400">
            Administra tus llaves de API, certificados criptográficos y datos tributarios de Hacienda en tiempo real.
          </p>
        </div>

        <a
          href="https://factura.gob.sv"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-colors"
        >
          Portal Oficial factura.gob.sv <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Banner de Éxito al Guardar */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/50 text-xs text-emerald-300 flex items-center justify-between shadow-xl shadow-emerald-950/40 animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-sm text-emerald-200">¡Credenciales guardadas y aplicadas!</p>
                <p className="text-[11px] text-emerald-400">
                  Las credenciales fueron actualizadas en el entorno y persistidas en el archivo <code className="text-white">.env</code>.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSaveSuccess(false)}
              className="text-emerald-400 hover:text-white px-2"
            >
              ✕
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Bloque Izquierdo: Formulario de Credenciales (7 columnas) */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Datos del Emisor / Contribuyente */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Building className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">1. Identificación del Contribuyente Emisor</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    NIT del Emisor * <span className="text-[10px] text-slate-500">(14 dígitos)</span>
                  </label>
                  <input
                    required
                    name="nit"
                    type="text"
                    value={formData.nit}
                    onChange={handleChange}
                    placeholder="06140101901012"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    NRC (Registro de Contribuyente) *
                  </label>
                  <input
                    required
                    name="nrc"
                    type="text"
                    value={formData.nrc}
                    onChange={handleChange}
                    placeholder="298765-4"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 font-semibold block mb-1">
                    Razón Social Registrada ante Hacienda *
                  </label>
                  <input
                    required
                    name="razonSocial"
                    type="text"
                    value={formData.razonSocial}
                    onChange={handleChange}
                    placeholder="COMERCIAL EJEMPLO S.A. DE C.V."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-bold focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Nombre Comercial (Fantasía)
                  </label>
                  <input
                    name="nombreComercial"
                    type="text"
                    value={formData.nombreComercial}
                    onChange={handleChange}
                    placeholder="Tienda DTE Express"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Código de Actividad Económica (CIU) *
                  </label>
                  <input
                    required
                    name="codActividad"
                    type="text"
                    value={formData.codActividad}
                    onChange={handleChange}
                    placeholder="47190"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 font-semibold block mb-1">
                    Descripción de Actividad Económica
                  </label>
                  <input
                    name="descActividad"
                    type="text"
                    value={formData.descActividad}
                    onChange={handleChange}
                    placeholder="Venta al por menor en comercios no especializados"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Teléfono del Emisor
                  </label>
                  <input
                    name="telefono"
                    type="text"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="2255-0000"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Correo Oficial de Facturación *
                  </label>
                  <input
                    required
                    name="correo"
                    type="email"
                    value={formData.correo}
                    onChange={handleChange}
                    placeholder="facturacion@miempresa.com.sv"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-slate-400 font-semibold block mb-1">
                    Dirección Fiscal Completa
                  </label>
                  <input
                    name="direccion"
                    type="text"
                    value={formData.direccion}
                    onChange={handleChange}
                    placeholder="Alameda Roosevelt #1234, San Salvador"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>

            {/* 2. Credenciales Criptográficas y de API */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Key className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-bold text-white">2. Claves de API & Seguridad Criptográfica</h2>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Ambiente de Transmisión del Ministerio de Hacienda *
                  </label>
                  <select
                    name="ambiente"
                    value={formData.ambiente}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold focus:outline-none focus:border-cyan-500"
                  >
                    <option value="00">Ambiente 00: Pruebas / Sandbox (apitest.dtes.mh.gob.sv)</option>
                    <option value="01">Ambiente 01: Producción Oficial (api.dtes.mh.gob.sv)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Clave de Acceso al API de Hacienda (Contraseña API) *
                  </label>
                  <div className="relative">
                    <input
                      required
                      name="claveApi"
                      type={showApiKey ? 'text' : 'password'}
                      value={formData.claveApi}
                      onChange={handleChange}
                      placeholder="Ingresa la clave generada en factura.gob.sv"
                      className="w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Utilizada para solicitar el Bearer Token JWT con validez de 24 horas.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">
                      Código Establecimiento MH *
                    </label>
                    <input
                      required
                      name="codEstablecimiento"
                      type="text"
                      value={formData.codEstablecimiento}
                      onChange={handleChange}
                      placeholder="M001"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-center focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">
                      Código Punto de Venta MH *
                    </label>
                    <input
                      required
                      name="codPuntoVenta"
                      type="text"
                      value={formData.codPuntoVenta}
                      onChange={handleChange}
                      placeholder="P001"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono text-center focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    URL del Servicio Firmador MH (Microservicio Local o Cloud)
                  </label>
                  <input
                    name="firmadorUrl"
                    type="text"
                    value={formData.firmadorUrl}
                    onChange={handleChange}
                    placeholder="http://localhost:8113/firmardocumento"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Por defecto en el puerto 8113. Si el firmador local no está corriendo, el sistema utiliza el emulador JWS automáticamente.
                  </span>
                </div>

                <div>
                  <label className="text-slate-400 font-semibold block mb-1">
                    Contraseña del Certificado Digital (.pfx / .p12)
                  </label>
                  <div className="relative">
                    <input
                      name="certPassword"
                      type={showCertPass ? 'text' : 'password'}
                      value={formData.certPassword}
                      onChange={handleChange}
                      placeholder="Contraseña de la llave privada del certificado"
                      className="w-full px-3 py-2.5 pr-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCertPass(!showCertPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showCertPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón Principal Guardar */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Guardando Cambios...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Guardar Credenciales Fiscales
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bloque Derecho: Prueba en Vivo & Guía Oficial (5 columnas) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Panel de Prueba de Conexión en Tiempo Real */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold text-white">Verificar Credenciales en Vivo</h2>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Prueba la validez de tu NIT y Clave de API directamente contra el servicio de autenticación del Ministerio de Hacienda:
              </p>

              <button
                type="button"
                disabled={testingConnection}
                onClick={handleTestConnection}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold border border-slate-700 flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {testingConnection ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Contactando Servidores de Hacienda...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Probar Autenticación con Hacienda
                  </>
                )}
              </button>

              {/* Resultado del Test */}
              {testResult && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2 ${
                  testResult.success
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/80 border-rose-500/40 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span>{testResult.success ? 'Diagnóstico Exitoso' : 'Error en Validación'}</span>
                  </div>

                  {testResult.tokenStatus && (
                    <p className="text-[11px] text-slate-200">{testResult.tokenStatus}</p>
                  )}

                  {testResult.tokenMuestra && (
                    <p className="text-[10px] font-mono bg-slate-900/80 p-2 rounded text-cyan-200 truncate">
                      JWT: {testResult.tokenMuestra}
                    </p>
                  )}

                  {testResult.tiempoRespuestaMs !== undefined && (
                    <p className="text-[10px] text-slate-400">
                      Tiempo de respuesta: <strong>{testResult.tiempoRespuestaMs} ms</strong> • Servidor: {testResult.servidorHacienda}
                    </p>
                  )}

                  {testResult.firmadorStatus && (
                    <div className="pt-1 border-t border-slate-800 text-[11px] text-slate-300">
                      Estado Firmador: <strong className="text-white">{testResult.firmadorStatus}</strong>
                    </div>
                  )}

                  {testResult.error && (
                    <p className="text-[11px] text-rose-300 font-mono mt-1">{testResult.error}</p>
                  )}

                  {testResult.nota && (
                    <p className="text-[10px] text-slate-400 italic mt-1">{testResult.nota}</p>
                  )}
                </div>
              )}
            </div>

            {/* ============================
                PANEL: FIRMADOR MH
            ============================= */}
            <div className="glass-panel p-6 rounded-3xl border border-violet-700/40 bg-violet-950/20 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-violet-800/40">
                <FileSignature className="w-5 h-5 text-violet-400" />
                <h2 className="text-base font-bold text-white">Firmador Digital MH (Microservicio Java)</h2>
                <span className={`ml-auto text-[9px] font-bold px-2 py-0.5 rounded-full ${
                  firmadorResult === null
                    ? 'bg-slate-800 text-slate-400'
                    : firmadorResult.online
                    ? 'bg-emerald-900 text-emerald-300 border border-emerald-600'
                    : 'bg-amber-900 text-amber-300 border border-amber-600'
                }`}>
                  {firmadorResult === null ? 'SIN VERIFICAR' : firmadorResult.online ? '● ACTIVO' : '● MODO EMULADOR'}
                </span>
              </div>

              {/* Descripción */}
              <div className="text-xs text-slate-400 leading-relaxed space-y-2">
                <p>
                  El <strong className="text-violet-300">Firmador MH</strong> es un microservicio Java oficial 
                  provisto por el Ministerio de Hacienda que firma criptográficamente cada DTE con tu 
                  certificado digital (<code className="text-violet-200 bg-slate-900/80 px-1 py-0.5 rounded">.pfx</code> / 
                  <code className="text-violet-200 bg-slate-900/80 px-1 py-0.5 rounded">.p12</code>) antes de transmitirlo.
                </p>
                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-950/30 border border-amber-700/30 text-amber-300">
                  <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-400" />
                  <p className="text-[11px]">
                    Si el firmador <strong>no está activo</strong>, el sistema usará automáticamente el 
                    <strong className="text-white"> Emulador Criptográfico Integrado</strong> (JWS + SHA-512 en Node.js) 
                    para entornos de prueba y desarrollo.
                  </p>
                </div>
              </div>

              {/* Botón de diagnóstico */}
              <button
                type="button"
                disabled={testingFirmador}
                onClick={handleTestFirmador}
                className="w-full py-3 rounded-xl bg-violet-900/40 hover:bg-violet-900/70 text-violet-200 text-xs font-bold border border-violet-700/50 flex items-center justify-center gap-2 transition-all shadow-md"
              >
                {testingFirmador ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verificando puerto 8113...
                  </>
                ) : (
                  <>
                    <Wifi className="w-4 h-4" />
                    Probar Conexión al Firmador MH
                  </>
                )}
              </button>

              {/* Resultado del diagnóstico del Firmador */}
              {firmadorResult && (
                <div className={`p-4 rounded-2xl border text-xs space-y-2.5 ${
                  firmadorResult.online
                    ? 'bg-emerald-950/60 border-emerald-600/30 text-emerald-300'
                    : 'bg-amber-950/60 border-amber-600/30 text-amber-300'
                }`}>
                  <div className="flex items-center gap-2 font-bold">
                    {firmadorResult.online
                      ? <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      : <WifiOff className="w-4 h-4 text-amber-400" />}
                    <span>
                      {firmadorResult.online ? 'Firmador MH Activo y Respondiendo' : 'Firmador MH No Detectado'}
                    </span>
                  </div>

                  {firmadorResult.mensaje && (
                    <p className="text-[11px] text-slate-200">{firmadorResult.mensaje}</p>
                  )}

                  {firmadorResult.error && (
                    <p className="text-[11px] text-amber-200 font-mono">{firmadorResult.error}</p>
                  )}

                  {firmadorResult.tiempoRespuestaMs !== undefined && (
                    <p className="text-[10px] text-slate-400">
                      Tiempo de respuesta: <strong>{firmadorResult.tiempoRespuestaMs} ms</strong>
                    </p>
                  )}

                  {!firmadorResult.online && firmadorResult.modoFallback && (
                    <div className="pt-2 border-t border-amber-800/40">
                      <p className="text-[10px] text-slate-300 flex items-center gap-1.5">
                        <Cpu className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>Modo activo: <strong className="text-cyan-300">{firmadorResult.modoFallback}</strong></span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Instrucciones de instalación */}
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-violet-300 uppercase tracking-wider">
                  Guía de Instalación del Firmador MH
                </p>

                <div className="space-y-2 text-xs">
                  {/* Paso 1 */}
                  <div className="flex gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] font-bold text-violet-400 bg-violet-900/50 rounded-full w-5 h-5 flex items-center justify-center shrink-0">1</span>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-200">Descargar el Firmador Oficial</p>
                      <p className="text-[11px] text-slate-400">Ingresa a tu portal del Ministerio de Hacienda en:</p>
                      <a
                        href="https://factura.gob.sv"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-violet-400 hover:text-violet-300 underline"
                      >
                        <ExternalLink className="w-3 h-3" /> factura.gob.sv → Herramientas → Firmador
                      </a>
                      <p className="text-[11px] text-slate-500">Descarga el archivo <code className="text-violet-200">firmador-mh-*.jar</code> o el paquete ZIP.</p>
                    </div>
                  </div>

                  {/* Paso 2 */}
                  <div className="flex gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] font-bold text-violet-400 bg-violet-900/50 rounded-full w-5 h-5 flex items-center justify-center shrink-0">2</span>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-200">Requisitos previos del sistema</p>
                      <div className="flex flex-wrap gap-2">
                        {['JDK 11+', 'Puerto 8113 libre', '.pfx o .p12 vigente'].map(req => (
                          <span key={req} className="text-[10px] bg-violet-900/40 text-violet-300 border border-violet-700/40 px-2 py-0.5 rounded-full">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Paso 3 */}
                  <div className="flex gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] font-bold text-violet-400 bg-violet-900/50 rounded-full w-5 h-5 flex items-center justify-center shrink-0">3</span>
                    <div className="space-y-2 w-full">
                      <p className="font-semibold text-slate-200">Iniciar el servicio</p>
                      <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[10px] text-emerald-300 leading-relaxed">
                        <div className="flex items-center gap-1 text-slate-500 mb-1.5">
                          <Terminal className="w-3 h-3" /> PowerShell / CMD
                        </div>
                        <p><span className="text-slate-500"># Coloca tu certificado .pfx aquí:</span></p>
                        <p className="text-yellow-200">java -jar firmador-mh.jar \</p>
                        <p className="pl-4 text-yellow-200">--cert-path=&quot;./certificado.pfx&quot; \</p>
                        <p className="pl-4 text-yellow-200">--cert-pass=&quot;tu_contraseña&quot; \</p>
                        <p className="pl-4 text-yellow-200">--port=8113</p>
                      </div>
                    </div>
                  </div>

                  {/* Paso 4 */}
                  <div className="flex gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="text-[10px] font-bold text-violet-400 bg-violet-900/50 rounded-full w-5 h-5 flex items-center justify-center shrink-0">4</span>
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-200">Verificar que funciona</p>
                      <p className="text-[11px] text-slate-400">
                        Una vez iniciado, abre un navegador y visita:{' '}
                        <code className="text-emerald-300">http://localhost:8113/signer/status</code>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Deberías ver <code className="text-white">running</code>. Luego haz clic en{' '}
                        <strong className="text-violet-300">&quot;Probar Conexión&quot;</strong> arriba.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ruta del certificado */}
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-700/30 text-xs space-y-2">
                <p className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> Ubicación recomendada del certificado
                </p>
                <code className="block text-[11px] bg-slate-900/80 p-2 rounded-lg text-cyan-200 font-mono">
                  ./certs/certificado_hacienda.pfx
                </code>
                <p className="text-[10px] text-slate-500">
                  Coloca el archivo <code>.pfx</code> en esta ruta dentro del proyecto. 
                  Nunca lo subas a Git — asegúrate de que <code>certs/</code> esté en <code>.gitignore</code>.
                </p>
              </div>
            </div>

            {/* Guía: ¿Dónde obtengo mis credenciales en factura.gob.sv? */}
            <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-400" />
                <h2 className="text-base font-bold text-white">¿Dónde obtener cada dato?</h2>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="font-bold text-cyan-300 flex items-center gap-1.5">
                    <FileKey className="w-3.5 h-3.5" /> Clave de Acceso API de Hacienda
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Ingresa a <a href="https://factura.gob.sv" target="_blank" className="text-cyan-400 underline">factura.gob.sv</a> con tu usuario del Ministerio de Hacienda, ve a la sección <strong>"Administración de Accesos"</strong> y genera tu Clave de API para el sistema de transmisión.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> Certificado de Firma (.pfx)
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Hacienda otorga un certificado digital de pruebas para firmar los DTEs. Debe ubicarse en la ruta configurada en tu sistema junto con su contraseña privada.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" /> Códigos M001 y P001
                  </span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Son los identificadores oficiales de tu establecimiento (sucursal o casa matriz) y de la caja/terminal de cobro otorgados por el Ministerio de Hacienda en la resolución de acreditación.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

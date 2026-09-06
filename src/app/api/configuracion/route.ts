import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    return NextResponse.json({
      ambiente: process.env.HACIENDA_AMBIENTE || '00',
      nit: process.env.HACIENDA_NIT || '06140101901012',
      nrc: process.env.HACIENDA_NRC || '298765-4',
      razonSocial: process.env.HACIENDA_RAZON_SOCIAL || 'COMERCIAL TIENDA SALVADOREÑA S.A. DE C.V.',
      nombreComercial: process.env.HACIENDA_NOMBRE_COMERCIAL || 'Tienda Express DTE',
      codActividad: process.env.HACIENDA_COD_ACTIVIDAD || '47190',
      descActividad: process.env.HACIENDA_DESC_ACTIVIDAD || 'Venta al por menor en comercios no especializados',
      direccion: process.env.HACIENDA_DIRECCION || 'Alameda Roosevelt #1234, San Salvador',
      telefono: process.env.HACIENDA_TELEFONO || '2255-0000',
      correo: process.env.HACIENDA_CORREO || 'facturacion@tiendaexpress.sv',
      codEstablecimiento: process.env.HACIENDA_COD_ESTABLECIMIENTO || 'M001',
      codPuntoVenta: process.env.HACIENDA_COD_PUNTO_VENTA || 'P001',
      claveApi: process.env.HACIENDA_CLAVE_API || '',
      firmadorUrl: process.env.FIRMADOR_MH_URL || 'http://localhost:8113/firmardocumento',
      certPassword: process.env.CERTIFICATE_PASSWORD || ''
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error leyendo configuración';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Actualizar variables de entorno en tiempo de ejecución
    if (data.ambiente) process.env.HACIENDA_AMBIENTE = data.ambiente;
    if (data.nit) process.env.HACIENDA_NIT = data.nit.replace(/-/g, '');
    if (data.nrc) process.env.HACIENDA_NRC = data.nrc;
    if (data.razonSocial) process.env.HACIENDA_RAZON_SOCIAL = data.razonSocial;
    if (data.nombreComercial) process.env.HACIENDA_NOMBRE_COMERCIAL = data.nombreComercial;
    if (data.codActividad) process.env.HACIENDA_COD_ACTIVIDAD = data.codActividad;
    if (data.descActividad) process.env.HACIENDA_DESC_ACTIVIDAD = data.descActividad;
    if (data.direccion) process.env.HACIENDA_DIRECCION = data.direccion;
    if (data.telefono) process.env.HACIENDA_TELEFONO = data.telefono;
    if (data.correo) process.env.HACIENDA_CORREO = data.correo;
    if (data.codEstablecimiento) process.env.HACIENDA_COD_ESTABLECIMIENTO = data.codEstablecimiento;
    if (data.codPuntoVenta) process.env.HACIENDA_COD_PUNTO_VENTA = data.codPuntoVenta;
    if (data.claveApi) process.env.HACIENDA_CLAVE_API = data.claveApi;
    if (data.firmadorUrl) process.env.FIRMADOR_MH_URL = data.firmadorUrl;
    if (data.certPassword) process.env.CERTIFICATE_PASSWORD = data.certPassword;

    // Persistir en el archivo .env
    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    const updates: Record<string, string> = {
      HACIENDA_AMBIENTE: data.ambiente || '00',
      HACIENDA_NIT: (data.nit || '').replace(/-/g, ''),
      HACIENDA_NRC: data.nrc || '',
      HACIENDA_RAZON_SOCIAL: data.razonSocial || '',
      HACIENDA_NOMBRE_COMERCIAL: data.nombreComercial || '',
      HACIENDA_COD_ACTIVIDAD: data.codActividad || '',
      HACIENDA_DESC_ACTIVIDAD: data.descActividad || '',
      HACIENDA_DIRECCION: data.direccion || '',
      HACIENDA_TELEFONO: data.telefono || '',
      HACIENDA_CORREO: data.correo || '',
      HACIENDA_COD_ESTABLECIMIENTO: data.codEstablecimiento || 'M001',
      HACIENDA_COD_PUNTO_VENTA: data.codPuntoVenta || 'P001',
      HACIENDA_CLAVE_API: data.claveApi || '',
      FIRMADOR_MH_URL: data.firmadorUrl || 'http://localhost:8113/firmardocumento',
      CERTIFICATE_PASSWORD: data.certPassword || ''
    };

    for (const [key, val] of Object.entries(updates)) {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}="${val}"`);
      } else {
        envContent += `\n${key}="${val}"`;
      }
    }

    fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf8');

    return NextResponse.json({
      success: true,
      mensaje: 'Credenciales y configuración fiscal guardadas con éxito en el sistema'
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error al guardar configuración';
    console.error('Error guardando configuración:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

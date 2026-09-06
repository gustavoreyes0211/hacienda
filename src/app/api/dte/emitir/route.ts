import { NextResponse } from 'next/server';
import { generarJsonDTE } from '@/lib/dte/generator';
import { firmarDocumentoDTE } from '@/lib/dte/signer';
import { transmitirDTEaHacienda } from '@/lib/dte/transmitter';
import { generateDteQRCodeDataUrl, getHaciendaConsultaPublicaUrl } from '@/lib/dte/qr';
import { DTEEmisor, DTEReceptor, TipoDTE, Ambiente } from '@/lib/dte/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      tipoDte = '01' as TipoDTE,
      cliente,
      items,
      metodoPago = '01',
      referenciaPago = '',
      correlativo = Math.floor(Date.now() / 1000) % 1000000000
    } = body;

    if (!items || !items.length) {
      return NextResponse.json(
        { error: 'Debe incluir al menos un producto o servicio en la venta' },
        { status: 400 }
      );
    }

    const ambiente: Ambiente = (process.env.HACIENDA_AMBIENTE as Ambiente) || '00';

    // Datos del Emisor (obtenidos del entorno o configuración)
    const emisor: DTEEmisor = {
      nit: process.env.HACIENDA_NIT || '06140101901012',
      nrc: process.env.HACIENDA_NRC || '298765-4',
      nombre: process.env.HACIENDA_RAZON_SOCIAL || 'COMERCIAL TIENDA SALVADOREÑA S.A. DE C.V.',
      nombreComercial: process.env.HACIENDA_NOMBRE_COMERCIAL || 'Tienda Express DTE',
      codActividad: process.env.HACIENDA_COD_ACTIVIDAD || '47190',
      descActividad: process.env.HACIENDA_DESC_ACTIVIDAD || 'Venta al por menor en comercios no especializados',
      tipoEstablecimiento: '01',
      direccion: {
        departamento: '06', // San Salvador
        municipio: '14',    // San Salvador Centro
        complemento: process.env.HACIENDA_DIRECCION || 'Alameda Roosevelt #1234'
      },
      telefono: process.env.HACIENDA_TELEFONO || '2255-0000',
      correo: process.env.HACIENDA_CORREO || 'facturacion@tiendaexpress.sv',
      codEstablecimientoMH: process.env.HACIENDA_COD_ESTABLECIMIENTO || 'M001',
      codPuntoVentaMH: process.env.HACIENDA_COD_PUNTO_VENTA || 'P001'
    };

    // Datos del Receptor
    const receptor: DTEReceptor = {
      tipoDocumento: cliente?.tipoDocumento || '13', // 13: DUI
      numDocumento: cliente?.numDocumento || '05123456-7',
      nrc: tipoDte === '03' ? (cliente?.nrc || '123456-7') : undefined,
      nombre: cliente?.nombre || 'CLIENTE CONSUMIDOR FINAL',
      codActividad: tipoDte === '03' ? (cliente?.codActividad || '47190') : undefined,
      descActividad: tipoDte === '03' ? (cliente?.descActividad || 'Comercio') : undefined,
      direccion: {
        departamento: cliente?.departamento || '06',
        municipio: cliente?.municipio || '14',
        complemento: cliente?.direccion || 'San Salvador'
      },
      telefono: cliente?.telefono || '7000-0000',
      correo: cliente?.correo || 'cliente@ejemplo.com'
    };

    // 1. Generar JSON DTE oficial
    const dteJson = generarJsonDTE({
      tipoDte,
      ambiente,
      correlativo,
      emisor,
      receptor,
      items,
      metodoPago,
      referenciaPago,
      observaciones: 'Venta registrada en Sistema de Tienda con Facturación DTE'
    });

    // 2. Firmar Documento (Firmador MH o Emulador Criptográfico JWS)
    const firmaResultado = await firmarDocumentoDTE(dteJson);

    // 3. Transmitir a Ministerio de Hacienda
    const respuestaMH = await transmitirDTEaHacienda({
      ambiente,
      signedDocument: firmaResultado.signedDocument,
      dteJson
    });

    // 4. Generar URL de consulta pública y Código QR
    const qrUrl = getHaciendaConsultaPublicaUrl({
      ambiente,
      codigoGeneracion: dteJson.identificacion.codigoGeneracion,
      fechaEmision: dteJson.identificacion.fecEmi
    });

    const qrDataUrl = await generateDteQRCodeDataUrl({
      ambiente,
      codigoGeneracion: dteJson.identificacion.codigoGeneracion,
      fechaEmision: dteJson.identificacion.fecEmi
    });

    return NextResponse.json({
      success: true,
      mensaje: 'DTE emitido y validado exitosamente ante el Ministerio de Hacienda',
      dte: {
        codigoGeneracion: dteJson.identificacion.codigoGeneracion,
        numeroControl: dteJson.identificacion.numeroControl,
        tipoDte: dteJson.identificacion.tipoDte,
        ambiente: dteJson.identificacion.ambiente,
        fechaEmision: dteJson.identificacion.fecEmi,
        horaEmision: dteJson.identificacion.horEmi,
        totalPagar: dteJson.resumen.totalPagar,
        totalLetras: dteJson.resumen.totalLetras,
        iva: dteJson.resumen.totalIva || (dteJson.resumen.tributos?.[0]?.valor ?? 0),
        receptor: dteJson.receptor,
        items: dteJson.cuerpoDocumento
      },
      firma: {
        modo: firmaResultado.modo,
        algoritmo: firmaResultado.algoritmo,
        tokenFirmado: firmaResultado.signedDocument.slice(0, 45) + '...'
      },
      hacienda: {
        estado: respuestaMH.estado,
        selloRecibido: respuestaMH.selloRecibido,
        fechaHoraProcesamiento: respuestaMH.fhProcesamiento,
        descripcion: respuestaMH.descripcionMsg
      },
      qr: {
        url: qrUrl,
        dataUrl: qrDataUrl
      },
      jsonOficial: dteJson
    });
  } catch (error: unknown) {
    console.error('Error emitiendo DTE:', error);
    const msg = error instanceof Error ? error.message : 'Error interno al procesar DTE';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

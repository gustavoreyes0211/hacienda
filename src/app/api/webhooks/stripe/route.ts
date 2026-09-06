import { NextResponse } from 'next/server';
import { stripe } from '@/lib/payments/stripe';
import { generarJsonDTE } from '@/lib/dte/generator';
import { firmarDocumentoDTE } from '@/lib/dte/signer';
import { transmitirDTEaHacienda } from '@/lib/dte/transmitter';
import { DTEEmisor, DTEReceptor, TipoDTE, Ambiente } from '@/lib/dte/types';

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && signature && !webhookSecret.startsWith('whsec_mock')) {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } else {
      // Modo desarrollo o simulación
      event = JSON.parse(payload);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Firma de webhook inválida';
    console.error('Error validando webhook de Stripe:', msg);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  // Manejar el evento de pago completado
  if (event.type === 'checkout.session.completed' || event.type === 'payment_intent.succeeded') {
    const session = event.data?.object;
    console.log('Pago recibido vía Stripe. Activando pipeline DTE de Hacienda...', session?.id);

    try {
      const tipoDte: TipoDTE = (session?.metadata?.tipoDte as TipoDTE) || '01';
      const ambiente: Ambiente = (process.env.HACIENDA_AMBIENTE as Ambiente) || '00';

      const emisor: DTEEmisor = {
        nit: process.env.HACIENDA_NIT || '06140101901012',
        nrc: process.env.HACIENDA_NRC || '298765-4',
        nombre: process.env.HACIENDA_RAZON_SOCIAL || 'COMERCIAL TIENDA SALVADOREÑA S.A. DE C.V.',
        nombreComercial: process.env.HACIENDA_NOMBRE_COMERCIAL || 'Tienda Express DTE',
        codActividad: process.env.HACIENDA_COD_ACTIVIDAD || '47190',
        descActividad: process.env.HACIENDA_DESC_ACTIVIDAD || 'Venta al por menor en comercios no especializados',
        tipoEstablecimiento: '01',
        direccion: {
          departamento: '06',
          municipio: '14',
          complemento: process.env.HACIENDA_DIRECCION || 'Alameda Roosevelt #1234'
        },
        telefono: process.env.HACIENDA_TELEFONO || '2255-0000',
        correo: process.env.HACIENDA_CORREO || 'facturacion@tiendaexpress.sv',
        codEstablecimientoMH: process.env.HACIENDA_COD_ESTABLECIMIENTO || 'M001',
        codPuntoVentaMH: process.env.HACIENDA_COD_PUNTO_VENTA || 'P001'
      };

      const receptor: DTEReceptor = {
        tipoDocumento: '13',
        numDocumento: '05123456-7',
        nombre: session?.metadata?.clienteNombre || session?.customer_details?.name || 'CLIENTE STRIPE ONLINE',
        direccion: {
          departamento: '06',
          municipio: '14',
          complemento: 'San Salvador'
        },
        telefono: '7000-0000',
        correo: session?.metadata?.clienteEmail || session?.customer_details?.email || 'cliente@ejemplo.com'
      };

      const montoTotal = session?.amount_total ? session.amount_total / 100 : 10.00;

      // 1. Generar JSON DTE oficial
      const dteJson = generarJsonDTE({
        tipoDte,
        ambiente,
        correlativo: Math.floor(Date.now() / 1000) % 1000000000,
        emisor,
        receptor,
        items: [
          {
            codigo: 'ONL-001',
            descripcion: session?.metadata?.descripcion || 'Compra en Línea con Tarjeta (Stripe)',
            cantidad: 1,
            precioUni: montoTotal,
            esGravado: true
          }
        ],
        metodoPago: '02', // 02: Tarjeta de Débito/Crédito
        referenciaPago: session?.id || 'STRIPE_TX',
        observaciones: `Auto-facturado por Webhook Stripe. Tx: ${session?.id}`
      });

      // 2. Firmar con microservicio o JWS
      const firma = await firmarDocumentoDTE(dteJson);

      // 3. Transmitir a Hacienda
      const respuestaMH = await transmitirDTEaHacienda({
        ambiente,
        signedDocument: firma.signedDocument,
        dteJson
      });

      console.log('DTE auto-emitido por webhook exitosamente:', {
        codigoGeneracion: dteJson.identificacion.codigoGeneracion,
        sello: respuestaMH.selloRecibido
      });

      return NextResponse.json({
        received: true,
        dteEmitido: true,
        codigoGeneracion: dteJson.identificacion.codigoGeneracion,
        selloRecibido: respuestaMH.selloRecibido
      });
    } catch (dteError) {
      console.error('Error al auto-emitir DTE en webhook de Stripe:', dteError);
      return NextResponse.json({ received: true, dteEmitido: false, error: String(dteError) });
    }
  }

  return NextResponse.json({ received: true });
}

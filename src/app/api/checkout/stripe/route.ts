import { NextResponse } from 'next/server';
import { crearSesionCheckoutStripe } from '@/lib/payments/stripe';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ordenId = `ORD-${Date.now()}`,
      clienteNombre = 'Cliente Tienda',
      clienteEmail = 'cliente@ejemplo.com',
      montoTotal,
      descripcion = 'Compra en Tienda',
      tipoDte = '01'
    } = body;

    if (!montoTotal || montoTotal <= 0) {
      return NextResponse.json(
        { error: 'El monto total debe ser mayor a cero' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${appUrl}/pos?pago_exitoso=true&orden=${ordenId}`;
    const cancelUrl = `${appUrl}/pos?pago_cancelado=true&orden=${ordenId}`;

    const session = await crearSesionCheckoutStripe({
      ordenId,
      clienteNombre,
      clienteEmail,
      montoTotal,
      descripcion,
      successUrl,
      cancelUrl,
      tipoDte
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      checkoutUrl: session.url
    });
  } catch (error: unknown) {
    console.error('Error al crear sesión de Stripe:', error);
    const msg = error instanceof Error ? error.message : 'Error al procesar checkout de Stripe';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

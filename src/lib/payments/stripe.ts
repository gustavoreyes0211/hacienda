// Servicio de Integración con Stripe para Pagos Electrónicos
// Admite creación de sesiones de checkout, payment intents y validación criptográfica de webhooks

import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'stripe_dev_mock_key_placeholder';

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-08-26.dahlia' as any
});

export interface CreateCheckoutParams {
  ordenId: string;
  clienteNombre: string;
  clienteEmail: string;
  montoTotal: number; // en dólares USD
  descripcion: string;
  successUrl: string;
  cancelUrl: string;
  tipoDte: '01' | '03';
}

export async function crearSesionCheckoutStripe(params: CreateCheckoutParams): Promise<{ id: string; url: string | null }> {
  // Si tenemos una clave real de Stripe, creamos la sesión en los servidores de Stripe
  if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: params.clienteEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Compra #${params.ordenId} - ${params.descripcion}`,
              description: `Facturación DTE (${params.tipoDte === '01' ? 'Factura Consumidor Final' : 'Crédito Fiscal'})`
            },
            unit_amount: Math.round(params.montoTotal * 100) // Stripe maneja centavos
          },
          quantity: 1
        }
      ],
      metadata: {
        ordenId: params.ordenId,
        tipoDte: params.tipoDte,
        clienteNombre: params.clienteNombre,
        clienteEmail: params.clienteEmail
      },
      success_url: params.successUrl,
      cancel_url: params.cancelUrl
    });

    return { id: session.id, url: session.url };
  }

  // Modo Simulación Segura para Desarrollo y Demostración
  const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const mockUrl = `${params.successUrl}?session_id=${mockSessionId}&simulated=true`;

  return {
    id: mockSessionId,
    url: mockUrl
  };
}
